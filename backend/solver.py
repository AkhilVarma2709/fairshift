"""
FairGuard — Layer 4: Scheduling Solver
-----------------------------------------------------------
This module preserves the existing burden and fairness math while
producing a workable weekly roster for the frontend and API.

`solve_schedule(request)` accepts the Contract-B-style request described
in the README and returns a response with either `status="optimal"` and
`data`, or `status="infeasible"` plus a message and suggestion.
"""

from __future__ import annotations

from math import ceil
from time import perf_counter

from fairness import jealousy_index, team_morale
from ortools.sat.python import cp_model


DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
SHIFT_TYPES = ["Morning", "Evening", "Night"]
DAY_INDEX = {day: idx for idx, day in enumerate(DAYS)}
SHIFT_CODE = {"Morning": 1, "Evening": 2, "Night": 3}
SHIFT_HOURS = {"Morning": 8, "Evening": 8, "Night": 8}

# Tunable constants called out in the README.
PAIN_X10 = {
    "Morning": 10,
    "Evening": 30,
    "Night": 150,
}
WEEKEND_EXTRA_X10 = 100
WEEKLY_BURDEN_ROLLOVER = 5
PREF_PENALTY = 8
OBJECTIVE_SCALE = 100
NIGHT_GAP_PENALTY = 40
SHIFT_GAP_PENALTY = 18
WEEKEND_GAP_PENALTY = 10
OVERLOAD_SHIFT_PENALTY = 3
OVERLOAD_NIGHT_PENALTY = 8
MAX_CONSECUTIVE_NIGHTS = 2
MAX_CONSECUTIVE_WORK_DAYS = 5


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _normalize_fairness_weight(weight: float | int | None) -> float:
    if weight is None:
        return 0.65
    numeric = float(weight)
    if numeric > 1.0:
        numeric /= 100.0
    return _clamp(numeric, 0.0, 1.0)


def _normalize_min_work_days(value: float | int | None) -> int:
    if value is None:
        return 0
    return int(_clamp(float(value), 0, 7))


def _normalize_max_work_days(value: float | int | None) -> int:
    if value is None:
        return 7
    return int(_clamp(float(value), 0, 7))


def _parse_shift_label(label: str) -> tuple[str, str]:
    core = label.split("#", 1)[0]
    parts = core.split("_", 1)
    if len(parts) != 2:
        raise ValueError(f"Unsupported shift label: {label}")
    day, shift_type = parts
    normalized = shift_type.capitalize()
    if day not in DAY_INDEX or normalized not in SHIFT_TYPES:
        raise ValueError(f"Unsupported shift label: {label}")
    return day, normalized


def shift_pain_x10(shift_type: str, day: str) -> int:
    pain = PAIN_X10[shift_type]
    if day in {"Sat", "Sun"}:
        pain += WEEKEND_EXTRA_X10
    return pain


def project_burden_from_codes(historical_burden: float, codes: list[int]) -> float:
    weekly_pain = 0
    for day, code in zip(DAYS, codes):
        if code == 0:
            continue
        weekly_pain += shift_pain_x10(SHIFT_TYPES[code - 1], day)
    burden_x10 = min(1000, round(historical_burden * 10) + weekly_pain // WEEKLY_BURDEN_ROLLOVER)
    return round(burden_x10 / 10.0, 1)


def _matches_blackout(token: str, day: str, shift_type: str, label: str) -> bool:
    normalized = token.strip().lower()
    candidates = {
        day.lower(),
        shift_type.lower(),
        label.lower(),
        f"{day}_{shift_type}".lower(),
        f"{day}_{shift_type}".replace("_", " ").lower(),
    }
    return normalized in candidates


def _preference_penalty(preferred: set[str], shift_type: str) -> int:
    if not preferred or shift_type in preferred:
        return 0
    return PREF_PENALTY


def solve_schedule(request: dict) -> dict:
    started = perf_counter()

    employees = list(request.get("employees", []))
    shifts = list(request.get("shifts", []))
    historical_burden = {name: float(value) for name, value in request.get("historical_burden", {}).items()}
    hourly_rate = {name: float(value) for name, value in request.get("hourly_rate", {}).items()}
    blackouts = request.get("blackouts", {}) or {}
    preferences = {
        employee: {value.capitalize() for value in values}
        for employee, values in (request.get("preferences", {}) or {}).items()
    }

    if not employees:
        return {
            "status": "infeasible",
            "message": "No employees were supplied to the solver.",
            "suggestion": "Provide at least one employee before running optimization.",
        }
    if not shifts:
        return {
            "status": "infeasible",
            "message": "No shifts were supplied to the solver.",
            "suggestion": "Provide at least one shift before running optimization.",
        }

    fairness_weight = _normalize_fairness_weight(request.get("fairness_weight"))
    min_work_days = _normalize_min_work_days(request.get("min_work_days"))
    max_work_days = _normalize_max_work_days(request.get("max_work_days"))
    if max_work_days < min_work_days:
        max_work_days = min_work_days
    alpha = float(request.get("_alpha_override", 1.0 - fairness_weight))
    beta = float(request.get("_beta_override", fairness_weight))
    alpha_scale = round(alpha * 10)
    beta_scale = round(beta * OBJECTIVE_SCALE)

    shift_meta = {shift: _parse_shift_label(shift) for shift in shifts}
    sorted_shifts = sorted(
        shifts,
        key=lambda shift: (
            DAY_INDEX[shift_meta[shift][0]],
            SHIFT_TYPES.index(shift_meta[shift][1]),
            shift,
        ),
    )
    total_shift_slots = len(sorted_shifts)
    total_night_slots = sum(1 for shift in sorted_shifts if shift_meta[shift][1] == "Night")
    employee_count = max(len(employees), 1)
    default_shift_cap = max(4, min(6, ceil(total_shift_slots / employee_count) + 2))
    default_night_cap = max(2, min(3, ceil(total_night_slots / employee_count) + 1))

    model = cp_model.CpModel()
    assign: dict[tuple[str, str], cp_model.IntVar] = {}
    shift_vars: dict[str, list[cp_model.IntVar]] = {shift: [] for shift in sorted_shifts}
    day_vars: dict[tuple[str, str], list[cp_model.IntVar]] = {}
    night_day_vars: dict[tuple[str, str], list[cp_model.IntVar]] = {}
    morning_day_vars: dict[tuple[str, str], list[cp_model.IntVar]] = {}
    weekend_day_vars: dict[tuple[str, str], list[cp_model.IntVar]] = {}

    for employee in employees:
        for day in DAYS:
            day_vars[(employee, day)] = []
            night_day_vars[(employee, day)] = []
            morning_day_vars[(employee, day)] = []
            weekend_day_vars[(employee, day)] = []

    for shift in sorted_shifts:
        day, shift_type = shift_meta[shift]
        for employee in employees:
            if any(_matches_blackout(token, day, shift_type, shift) for token in blackouts.get(employee, [])):
                continue
            var = model.NewBoolVar(f"assign_{employee}_{shift}")
            assign[(employee, shift)] = var
            shift_vars[shift].append(var)
            day_vars[(employee, day)].append(var)
            if shift_type == "Night":
                night_day_vars[(employee, day)].append(var)
            if shift_type == "Morning":
                morning_day_vars[(employee, day)].append(var)
            if day in {"Sat", "Sun"}:
                weekend_day_vars[(employee, day)].append(var)

    for shift, vars_for_shift in shift_vars.items():
        if not vars_for_shift:
            return {
                "status": "infeasible",
                "message": f"FairGuard could not cover {shift}.",
                "suggestion": "Relax blackout rules, reduce coverage requirements, or add more available employees.",
            }
        model.Add(sum(vars_for_shift) == 1)

    work_day: dict[tuple[str, str], cp_model.IntVar] = {}
    night_day: dict[tuple[str, str], cp_model.IntVar] = {}
    morning_day: dict[tuple[str, str], cp_model.IntVar] = {}
    weekend_day: dict[tuple[str, str], cp_model.IntVar] = {}

    for employee in employees:
        for day in DAYS:
            worked = model.NewBoolVar(f"worked_{employee}_{day}")
            work_day[(employee, day)] = worked
            model.Add(sum(day_vars[(employee, day)]) == worked)

            night_worked = model.NewBoolVar(f"night_{employee}_{day}")
            night_day[(employee, day)] = night_worked
            model.Add(sum(night_day_vars[(employee, day)]) == night_worked)

            morning_worked = model.NewBoolVar(f"morning_{employee}_{day}")
            morning_day[(employee, day)] = morning_worked
            model.Add(sum(morning_day_vars[(employee, day)]) == morning_worked)

            weekend_worked = model.NewBoolVar(f"weekend_{employee}_{day}")
            weekend_day[(employee, day)] = weekend_worked
            model.Add(sum(weekend_day_vars[(employee, day)]) == weekend_worked)

    total_shift_count: dict[str, cp_model.IntVar] = {}
    total_night_count: dict[str, cp_model.IntVar] = {}
    total_weekend_count: dict[str, cp_model.IntVar] = {}
    burden_x10_vars: dict[str, cp_model.IntVar] = {}
    overload_shift_terms: list[cp_model.LinearExpr] = []
    overload_night_terms: list[cp_model.LinearExpr] = []
    cost_terms: list[cp_model.LinearExpr] = []
    preference_terms: list[cp_model.LinearExpr] = []

    for employee in employees:
        day_work_vars = [work_day[(employee, day)] for day in DAYS]
        night_work_vars = [night_day[(employee, day)] for day in DAYS]
        weekend_work_vars = [weekend_day[(employee, day)] for day in ("Sat", "Sun")]

        total_shifts = model.NewIntVar(0, len(DAYS), f"total_shifts_{employee}")
        total_nights = model.NewIntVar(0, len(DAYS), f"total_nights_{employee}")
        total_weekends = model.NewIntVar(0, 2, f"total_weekends_{employee}")
        model.Add(total_shifts == sum(day_work_vars))
        model.Add(total_nights == sum(night_work_vars))
        model.Add(total_weekends == sum(weekend_work_vars))
        total_shift_count[employee] = total_shifts
        total_night_count[employee] = total_nights
        total_weekend_count[employee] = total_weekends
        if min_work_days > 0:
            model.Add(total_shifts >= min_work_days)

        for start_idx in range(len(DAYS) - MAX_CONSECUTIVE_WORK_DAYS):
            window = day_work_vars[start_idx : start_idx + MAX_CONSECUTIVE_WORK_DAYS + 1]
            model.Add(sum(window) <= MAX_CONSECUTIVE_WORK_DAYS)

        for start_idx in range(len(DAYS) - MAX_CONSECUTIVE_NIGHTS):
            window = night_work_vars[start_idx : start_idx + MAX_CONSECUTIVE_NIGHTS + 1]
            model.Add(sum(window) <= MAX_CONSECUTIVE_NIGHTS)

        for day_idx in range(len(DAYS) - 1):
            model.Add(night_day[(employee, DAYS[day_idx])] + morning_day[(employee, DAYS[day_idx + 1])] <= 1)

        pain_terms = []
        employee_cost_terms = []
        employee_pref_terms = []
        employee_overload_shift_terms = []
        employee_overload_night_terms = []
        historical_burden_int = int(round(historical_burden.get(employee, 0.0)))
        overload_shift_weight = max(0, historical_burden_int - 45)
        overload_night_weight = max(0, historical_burden_int - 30)
        max_shift_cap = min(default_shift_cap, max_work_days)
        max_night_cap = default_night_cap
        if historical_burden_int >= 75:
            max_shift_cap = min(max_shift_cap, 4)
            max_night_cap = min(max_night_cap, 1)
        elif historical_burden_int >= 60:
            max_shift_cap = min(max_shift_cap, 5)
            max_night_cap = min(max_night_cap, 2)

        model.Add(total_shifts <= max_shift_cap)
        model.Add(total_nights <= max_night_cap)

        for shift in sorted_shifts:
            var = assign.get((employee, shift))
            if var is None:
                continue
            day, shift_type = shift_meta[shift]
            pain_terms.append(shift_pain_x10(shift_type, day) * var)
            employee_cost_terms.append(int(round(hourly_rate.get(employee, 0.0) * SHIFT_HOURS[shift_type])) * var)
            employee_pref_terms.append(_preference_penalty(preferences.get(employee, set()), shift_type) * var)
            employee_overload_shift_terms.append(overload_shift_weight * var)
            if shift_type == "Night":
                employee_overload_night_terms.append(overload_night_weight * var)

        weekly_pain_rollover = model.NewIntVar(0, 500, f"weekly_rollover_{employee}")
        weekly_pain_total = sum(pain_terms) if pain_terms else 0
        model.AddDivisionEquality(weekly_pain_rollover, weekly_pain_total, WEEKLY_BURDEN_ROLLOVER)

        raw_burden = model.NewIntVar(0, 1500, f"raw_burden_{employee}")
        model.Add(raw_burden == round(historical_burden.get(employee, 0.0) * 10) + weekly_pain_rollover)
        burden_var = model.NewIntVar(0, 1000, f"burden_x10_{employee}")
        model.AddMinEquality(burden_var, [raw_burden, 1000])
        burden_x10_vars[employee] = burden_var

        if employee_cost_terms:
            cost_terms.extend(employee_cost_terms)
        if employee_pref_terms:
            preference_terms.extend(employee_pref_terms)
        if employee_overload_shift_terms:
            overload_shift_terms.extend(employee_overload_shift_terms)
        if employee_overload_night_terms:
            overload_night_terms.extend(employee_overload_night_terms)

    burden_max = model.NewIntVar(0, 1000, "burden_max")
    burden_min = model.NewIntVar(0, 1000, "burden_min")
    model.AddMaxEquality(burden_max, list(burden_x10_vars.values()))
    model.AddMinEquality(burden_min, list(burden_x10_vars.values()))
    burden_gap = model.NewIntVar(0, 1000, "burden_gap")
    model.Add(burden_gap == burden_max - burden_min)

    shift_max = model.NewIntVar(0, len(DAYS), "shift_max")
    shift_min = model.NewIntVar(0, len(DAYS), "shift_min")
    model.AddMaxEquality(shift_max, list(total_shift_count.values()))
    model.AddMinEquality(shift_min, list(total_shift_count.values()))
    shift_gap = model.NewIntVar(0, len(DAYS), "shift_gap")
    model.Add(shift_gap == shift_max - shift_min)

    night_max = model.NewIntVar(0, len(DAYS), "night_max")
    night_min = model.NewIntVar(0, len(DAYS), "night_min")
    model.AddMaxEquality(night_max, list(total_night_count.values()))
    model.AddMinEquality(night_min, list(total_night_count.values()))
    night_gap = model.NewIntVar(0, len(DAYS), "night_gap")
    model.Add(night_gap == night_max - night_min)

    weekend_max = model.NewIntVar(0, 2, "weekend_max")
    weekend_min = model.NewIntVar(0, 2, "weekend_min")
    model.AddMaxEquality(weekend_max, list(total_weekend_count.values()))
    model.AddMinEquality(weekend_min, list(total_weekend_count.values()))
    weekend_gap = model.NewIntVar(0, 2, "weekend_gap")
    model.Add(weekend_gap == weekend_max - weekend_min)

    objective = (
        alpha_scale * sum(cost_terms)
        + beta_scale * (
            burden_gap * 10
            + night_gap * NIGHT_GAP_PENALTY
            + shift_gap * SHIFT_GAP_PENALTY
            + weekend_gap * WEEKEND_GAP_PENALTY
        )
        + 10 * sum(preference_terms)
        + OVERLOAD_SHIFT_PENALTY * sum(overload_shift_terms)
        + OVERLOAD_NIGHT_PENALTY * sum(overload_night_terms)
    )
    model.Minimize(objective)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0
    solver.parameters.num_search_workers = 8
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "status": "infeasible",
            "message": "FairGuard could not build a feasible schedule with the current rules.",
            "suggestion": "Relax blackout rules, reduce coverage requirements, or add more available employees.",
        }

    schedule_by_employee = {employee: [0] * 7 for employee in employees}
    hours_by_employee = {employee: 0 for employee in employees}
    cost_by_employee = {employee: 0 for employee in employees}
    assigned_shift_count = {employee: 0 for employee in employees}
    assigned_night_count = {employee: 0 for employee in employees}
    assignments: dict[str, str] = {}

    for shift in sorted_shifts:
        assigned_employee = None
        day, shift_type = shift_meta[shift]
        day_idx = DAY_INDEX[day]
        for employee in employees:
            var = assign.get((employee, shift))
            if var is None:
                continue
            if solver.Value(var):
                assigned_employee = employee
                break
        if assigned_employee is None:
            return {
                "status": "infeasible",
                "message": f"FairGuard could not cover {shift}.",
                "suggestion": "Relax blackout rules, reduce coverage requirements, or add more available employees.",
            }
        assignments[shift] = assigned_employee
        schedule_by_employee[assigned_employee][day_idx] = SHIFT_CODE[shift_type]
        hours_by_employee[assigned_employee] += SHIFT_HOURS[shift_type]
        cost_by_employee[assigned_employee] += int(round(hourly_rate.get(assigned_employee, 0.0) * SHIFT_HOURS[shift_type]))
        assigned_shift_count[assigned_employee] += 1
        if shift_type == "Night":
            assigned_night_count[assigned_employee] += 1

    burden_scores = {
        employee: round(solver.Value(burden_x10_vars[employee]) / 10.0, 1)
        for employee in employees
    }
    gap_value = round(jealousy_index(burden_scores), 1)
    morale_value = team_morale(burden_scores)

    return {
        "status": "optimal",
        "data": {
            "assignments": assignments,
            "schedule_by_employee": schedule_by_employee,
            "hours_by_employee": hours_by_employee,
            "cost_by_employee": cost_by_employee,
            "shift_count_by_employee": assigned_shift_count,
            "night_count_by_employee": assigned_night_count,
            "burden_scores": burden_scores,
            "gap": gap_value,
            "team_morale": morale_value,
            "total_cost": int(sum(cost_by_employee.values())),
            "preference_penalty": int(
                sum(
                    _preference_penalty(preferences.get(employee, set()), SHIFT_TYPES[code - 1])
                    for employee, codes in schedule_by_employee.items()
                    for code in codes
                    if code
                )
            ),
            "fairness_weight": round(fairness_weight, 2),
            "min_work_days": min_work_days,
            "max_work_days": max_work_days,
            "alpha": round(alpha, 2),
            "beta": round(beta, 2),
            "conflicts": 0,
            "took_ms": int(round((perf_counter() - started) * 1000)),
        },
    }
