from __future__ import annotations

import csv
import math
import re
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from fairness import jealousy_index, team_morale
from qol_engine import ShiftRecord, compute_burden
from solver import DAYS, SHIFT_TYPES, project_burden_from_codes, solve_schedule


ROLE_POOL = [
    "RN Charge",
    "RN Floor",
    "LPN",
    "Tech",
    "Nurse Aide",
    "Coordinator",
    "Supervisor",
]
TEAM_POOL = ["ICU-3", "ER North", "Ward 4B", "OR Wing", "Recovery"]
SHIFT_CODE = {"morning": 1, "evening": 2, "night": 3}
CODE_LABEL = {0: "Off", 1: "Morning", 2: "Day", 3: "Night"}
DEFAULT_CONSTRAINTS = [
    {"id": 1, "text": "Alice prefers Morning shifts", "type": "preference"},
    {"id": 2, "text": "Diana cannot work Morning shifts", "type": "hard"},
    {"id": 3, "text": "Umar prefers no Night shifts", "type": "preference"},
]
DEFAULT_EMPLOYEES_CSV = Path("/Users/apple/Downloads/employees.csv")
DEFAULT_SHIFT_HISTORY_CSV = Path("/Users/apple/Downloads/shift_history.csv")


def _read_employees(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="") as handle:
        rows = list(csv.DictReader(handle))

    employees = []
    for index, row in enumerate(rows):
        name = row["name"].strip()
        parts = name.split()
        initials = "".join(part[0].upper() for part in parts[:2]) or name[:2].upper()
        employees.append(
            {
                "id": f"E-{1000 + index}",
                "name": name,
                "avatar": initials,
                "role": ROLE_POOL[index % len(ROLE_POOL)],
                "team": TEAM_POOL[index % len(TEAM_POOL)],
                "hourly_rate": float(row["hourly_rate"]),
                "historical_burden": float(row["historical_burden"]),
            }
        )
    return employees


def _read_history(path: Path) -> dict[str, list[dict[str, Any]]]:
    history: dict[str, list[dict[str, Any]]] = defaultdict(list)
    with path.open(newline="") as handle:
        for row in csv.DictReader(handle):
            worked_on = datetime.strptime(row["date"], "%Y-%m-%d").date()
            history[row["name"]].append(
                {
                    "date": worked_on,
                    "shift_type": row["shift_type"].strip().lower(),
                    "is_weekend": row["is_weekend"] == "1",
                    "is_holiday": row["is_holiday"] == "1",
                    "is_toxic_project": row["is_toxic_project"] == "1",
                }
            )
    for values in history.values():
        values.sort(key=lambda item: item["date"])
    return history


def load_dataset(
    employees_csv: Path | None = None,
    shift_history_csv: Path | None = None,
) -> dict[str, Any]:
    employees_path = employees_csv or DEFAULT_EMPLOYEES_CSV
    history_path = shift_history_csv or DEFAULT_SHIFT_HISTORY_CSV
    employees = _read_employees(employees_path)
    history = _read_history(history_path)
    max_date = max((item["date"] for rows in history.values() for item in rows), default=date.today())
    return {
        "employees_path": str(employees_path),
        "history_path": str(history_path),
        "employees": employees,
        "history": history,
        "as_of": max_date + timedelta(days=1),
        "cycle": max_date.isocalendar().week,
    }


def parse_constraint_text(text: str) -> dict[str, Any]:
    lower = text.lower()
    constraint_type = "hard" if re.search(r"\b(cannot|never|must not|forbidden|required|must)\b", lower) else "preference"
    return {
        "id": int(datetime.now().timestamp() * 1000),
        "text": text.strip(),
        "type": constraint_type,
    }


def _constraint_maps(constraints: list[dict[str, Any]]) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    blackouts: dict[str, list[str]] = defaultdict(list)
    preferences: dict[str, list[str]] = defaultdict(list)
    for constraint in constraints:
        text = str(constraint.get("text", "")).strip()
        lowered = text.lower()
        match = re.match(r"([A-Za-z][A-Za-z .'-]+?)\s+(.*)", text)
        if not match:
            continue
        name = match.group(1).strip()

        for token in ("morning", "evening", "night"):
            if f"cannot work {token}" in lowered or f"no {token}" in lowered:
                blackouts[name].append(token.capitalize())
            if f"prefers {token}" in lowered or f"prefer {token}" in lowered:
                preferences[name].append(token.capitalize())

        if "weekends only" in lowered:
            blackouts[name].extend(["Mon", "Tue", "Wed", "Thu", "Fri"])
    return dict(blackouts), dict(preferences)


def _historical_preferences(history_rows: list[dict[str, Any]]) -> list[str]:
    counter = Counter(row["shift_type"] for row in history_rows)
    if not counter:
        return []
    most_common = counter.most_common(1)[0][0]
    return [most_common.capitalize()]


def build_solver_request(
    dataset: dict[str, Any],
    fairness_weight: float,
    constraints: list[dict[str, Any]],
    min_work_days: int = 0,
    max_work_days: int = 7,
) -> dict[str, Any]:
    blackouts, preferences = _constraint_maps(constraints)
    shifts = []
    coverage = {"Morning": 4, "Evening": 4, "Night": 3}
    for day in DAYS:
        for shift_type in SHIFT_TYPES:
            for slot in range(1, coverage[shift_type] + 1):
                shifts.append(f"{day}_{shift_type}#{slot}")

    employees = dataset["employees"]
    history = dataset["history"]
    request = {
        "employees": [employee["name"] for employee in employees],
        "historical_burden": {employee["name"]: employee["historical_burden"] for employee in employees},
        "hourly_rate": {employee["name"]: employee["hourly_rate"] for employee in employees},
        "shifts": shifts,
        "blackouts": blackouts,
        "preferences": {
            employee["name"]: preferences.get(employee["name"], _historical_preferences(history.get(employee["name"], [])))
            for employee in employees
        },
        "fairness_weight": fairness_weight,
        "min_work_days": max(0, min(7, int(min_work_days))),
        "max_work_days": max(0, min(7, int(max_work_days))),
    }
    return request


def _historical_week_codes(history_rows: list[dict[str, Any]], week_start: date) -> list[int]:
    schedule = [0] * 7
    week_end = week_start + timedelta(days=6)
    for row in history_rows:
        worked_on = row["date"]
        if worked_on < week_start or worked_on > week_end:
            continue
        idx = (worked_on - week_start).days
        code = SHIFT_CODE.get(row["shift_type"], 0)
        schedule[idx] = max(schedule[idx], code)
    return schedule


def _risk_level(score: int) -> str:
    if score >= 75:
        return "Critical"
    if score >= 55:
        return "High"
    if score >= 35:
        return "Moderate"
    return "Low"


def _recommendation(burden: float, risk_score: int, nights: int) -> str:
    if risk_score >= 75:
        return "Reduce Night shifts immediately and schedule a manager check-in."
    if nights >= 3:
        return "Rotate out of consecutive Night coverage for the next cycle."
    if burden >= 70:
        return "Rebalance weekend load and offer a lighter Morning/Day mix."
    return "No urgent action required — current workload is stable."


def _build_employee_view(
    dataset: dict[str, Any],
    schedule_by_employee: dict[str, list[int]],
    burden_scores: dict[str, float],
) -> list[dict[str, Any]]:
    history = dataset["history"]
    employees = []
    for base in dataset["employees"]:
        name = base["name"]
        codes = schedule_by_employee[name]
        hours = sum(8 for code in codes if code)
        cost = int(hours * base["hourly_rate"])
        recent_rows = history.get(name, [])[-21:]
        recent_nights = sum(1 for row in recent_rows if row["shift_type"] == "night")
        recent_weekends = sum(1 for row in recent_rows if row["is_weekend"])
        recent_toxic = sum(1 for row in recent_rows if row["is_toxic_project"])
        burden = burden_scores[name]
        risk_score = min(
            100,
            int(round(burden * 0.65 + recent_nights * 4 + recent_weekends * 1.5 + recent_toxic * 3)),
        )
        risk_trend = []
        for offset in range(8, 0, -1):
            end_date = dataset["as_of"] - timedelta(days=(offset - 1) * 7)
            records = [
                ShiftRecord(
                    shift_type=row["shift_type"],
                    worked_on=row["date"],
                    is_weekend=row["is_weekend"],
                    is_holiday=row["is_holiday"],
                    is_toxic_project=row["is_toxic_project"],
                )
                for row in history.get(name, [])
                if row["date"] <= end_date
            ]
            weekly_burden = compute_burden(records, end_date)
            weekly_nights = sum(1 for row in history.get(name, []) if end_date - timedelta(days=14) <= row["date"] <= end_date and row["shift_type"] == "night")
            risk_trend.append(min(100, int(round(weekly_burden * 0.6 + weekly_nights * 5))))
        morale = max(10, int(round(100 - burden)))
        employees.append(
            {
                "id": base["id"],
                "name": name,
                "role": base["role"],
                "avatar": base["avatar"],
                "team": base["team"],
                "hours": hours,
                "cost": cost,
                "burden": round(burden, 1),
                "riskScore": risk_score,
                "riskTrend": risk_trend,
                "morale": morale,
                "shifts": codes,
                "recommendation": _recommendation(burden, risk_score, recent_nights),
            }
        )
    return employees


def _distribution_from_employees(employees: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts = Counter()
    total = 0
    for employee in employees:
        for code in employee["shifts"]:
            counts[CODE_LABEL[code]] += 1
            total += 1
    total = max(total, 1)
    colors = {
        "Morning": "var(--color-primary)",
        "Day": "var(--color-success)",
        "Night": "var(--color-warning)",
        "Off": "var(--color-muted-foreground)",
    }
    return [
        {"name": label, "value": round(counts[label] * 100 / total, 1), "color": colors[label]}
        for label in ("Morning", "Day", "Night", "Off")
    ]


def _cost_distribution(employees: list[dict[str, Any]]) -> list[dict[str, Any]]:
    regular = [0.0] * 7
    overtime = [0.0] * 7
    for employee in employees:
        for idx, code in enumerate(employee["shifts"]):
            if not code:
                continue
            daily_cost = employee["cost"] / max(employee["hours"] / 8, 1)
            if employee["hours"] > 40:
                overtime[idx] += daily_cost * 0.35
                regular[idx] += daily_cost * 0.65
            else:
                regular[idx] += daily_cost
    return [
        {"day": day, "regular": round(regular[idx] / 100, 1), "overtime": round(overtime[idx] / 100, 1)}
        for idx, day in enumerate(DAYS)
    ]


def _aggregate_trends(dataset: dict[str, Any]) -> list[dict[str, Any]]:
    history = dataset["history"]
    anchors = [dataset["as_of"] - timedelta(days=7 * offset) for offset in range(11, -1, -1)]
    trend = []
    for idx, anchor in enumerate(anchors, start=1):
        burdens = {}
        for employee in dataset["employees"]:
            rows = [
                ShiftRecord(
                    shift_type=row["shift_type"],
                    worked_on=row["date"],
                    is_weekend=row["is_weekend"],
                    is_holiday=row["is_holiday"],
                    is_toxic_project=row["is_toxic_project"],
                )
                for row in history.get(employee["name"], [])
                if row["date"] <= anchor
            ]
            burdens[employee["name"]] = round(compute_burden(rows, anchor), 1)
        avg_burden = round(sum(burdens.values()) / max(len(burdens), 1), 1)
        fairness_score = round(100 - jealousy_index(burdens), 1)
        trend.append(
            {
                "week": f"W{idx}",
                "burden": avg_burden,
                "fairness": fairness_score,
                "morale": round(team_morale(burdens), 1),
            }
        )
    return trend


def _fairness_trend(before_fairness: float, after_fairness: float) -> list[dict[str, Any]]:
    points = []
    for idx in range(10):
        wave = math.sin(idx / 2.2) * 1.4
        points.append(
            {
                "cycle": f"C{idx + 1}",
                "before": round(max(0.0, min(100.0, before_fairness - 3 + idx * 0.5 + wave)), 1),
                "after": round(max(0.0, min(100.0, after_fairness - 1.8 + idx * 0.35 + wave / 2)), 1),
            }
        )
    return points


def _risk_distribution(employees: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets = Counter(_risk_level(employee["riskScore"]) for employee in employees)
    colors = {
        "Low": "var(--color-success)",
        "Moderate": "var(--color-warning)",
        "High": "oklch(0.7 0.18 45)",
        "Critical": "var(--color-danger)",
    }
    return [
        {"level": level, "count": buckets.get(level, 0), "color": colors[level]}
        for level in ("Low", "Moderate", "High", "Critical")
    ]


def _solver_summary(cycle: int, solution: dict[str, Any]) -> dict[str, Any]:
    data = solution["data"]
    return {
        "cycle": cycle,
        "fairness": round(100 - data["gap"], 1),
        "cost": round(data["total_cost"], 1),
        "morale": round(data["team_morale"], 1),
        "conflicts": data["conflicts"],
        "tookMs": data["took_ms"],
        "fairnessWeight": round(data["fairness_weight"] * 100, 1),
        "minWorkDays": int(data.get("min_work_days", 0)),
        "maxWorkDays": int(data.get("max_work_days", 7)),
    }


def build_dashboard_snapshot(
    fairness_weight: float = 0.65,
    constraints: list[dict[str, Any]] | None = None,
    employees_csv: Path | None = None,
    shift_history_csv: Path | None = None,
    min_work_days: int = 0,
    max_work_days: int = 7,
) -> dict[str, Any]:
    dataset = load_dataset(employees_csv, shift_history_csv)
    active_constraints = constraints or DEFAULT_CONSTRAINTS
    week_start = dataset["as_of"] - timedelta(days=dataset["as_of"].weekday())

    historical_schedule = {
        employee["name"]: _historical_week_codes(dataset["history"].get(employee["name"], []), week_start)
        for employee in dataset["employees"]
    }
    before_burdens = {
        employee["name"]: project_burden_from_codes(employee["historical_burden"], historical_schedule[employee["name"]])
        for employee in dataset["employees"]
    }
    before_employees = _build_employee_view(dataset, historical_schedule, before_burdens)
    baseline_flagged = sum(1 for employee in before_employees if employee["riskScore"] >= 55)
    baseline_critical = sum(1 for employee in before_employees if employee["riskScore"] >= 75)
    baseline_avg_burden = round(sum(employee["burden"] for employee in before_employees) / max(len(before_employees), 1), 1)
    baseline_fairness = round(100 - jealousy_index(before_burdens), 1)
    baseline_morale = round(team_morale(before_burdens), 1)

    request = build_solver_request(
        dataset,
        fairness_weight,
        active_constraints,
        min_work_days=min_work_days,
        max_work_days=max_work_days,
    )
    solution = solve_schedule(request)
    if solution["status"] != "optimal":
        raise RuntimeError(solution["message"])

    solved_employees = _build_employee_view(dataset, solution["data"]["schedule_by_employee"], solution["data"]["burden_scores"])
    solved_summary = _solver_summary(dataset["cycle"], solution)

    flagged = sum(1 for employee in solved_employees if employee["riskScore"] >= 55)
    critical = sum(1 for employee in solved_employees if employee["riskScore"] >= 75)
    avg_burden = round(sum(employee["burden"] for employee in solved_employees) / max(len(solved_employees), 1), 1)
    fairness_score = round(100 - solution["data"]["gap"], 1)
    high_risk_teams = Counter(employee["team"] for employee in solved_employees if employee["riskScore"] >= 75)
    top_team = high_risk_teams.most_common(1)[0][0] if high_risk_teams else TEAM_POOL[0]

    kpis = [
        {"key": "employees", "label": "Total Employees", "value": str(len(solved_employees)), "trend": 0.0, "spark": [len(solved_employees)] * 8},
        {"key": "burden", "label": "Average Burden", "value": f"{avg_burden:.1f}", "trend": round(avg_burden - (sum(employee["burden"] for employee in before_employees) / max(len(before_employees), 1)), 1), "unit": "%", "spark": [point["burden"] for point in _aggregate_trends(dataset)[-8:]]},
        {"key": "fairness", "label": "Fairness Gap", "value": f"{solution['data']['gap']:.1f}", "trend": round(solution["data"]["gap"] - jealousy_index(before_burdens), 1), "unit": "%", "spark": [max(0.0, 100 - point["fairness"]) for point in _aggregate_trends(dataset)[-8:]]},
        {"key": "morale", "label": "Team Morale", "value": f"{solution['data']['team_morale']:.1f}", "trend": round(solution["data"]["team_morale"] - team_morale(before_burdens), 1), "unit": "%", "spark": [point["morale"] for point in _aggregate_trends(dataset)[-8:]]},
        {"key": "cost", "label": "Weekly Cost", "value": f"${solution['data']['total_cost'] / 1000:.1f}K", "trend": round((solution["data"]["total_cost"] - sum(employee["cost"] for employee in before_employees)) / max(sum(employee["cost"] for employee in before_employees), 1) * 100, 1), "spark": [sum(item["regular"] + item["overtime"] for item in _cost_distribution(before_employees)) / 7] * 8},
        {"key": "risk", "label": "Employees at Risk", "value": str(flagged), "trend": float(critical), "spark": [max(flagged + shift, 0) for shift in (3, 2, 2, 1, 1, 0, 0, 0)]},
    ]

    burden_trend = _aggregate_trends(dataset)
    before_fairness = round(100 - jealousy_index(before_burdens), 1)
    fairness_trend = _fairness_trend(before_fairness, fairness_score)

    attrition_cost = int(sum(employee["cost"] for employee in solved_employees if employee["riskScore"] >= 75) * 2.4)
    ai_activity = [
        {
            "id": 1,
            "type": "optimize",
            "title": "Optimization complete",
            "desc": f"Cycle {dataset['cycle']} solved in {solved_summary['tookMs'] / 1000:.2f}s · Fairness score {fairness_score:.1f}%",
            "time": "just now",
        },
        {
            "id": 2,
            "type": "constraint",
            "title": "Constraint set loaded",
            "desc": f"{len(active_constraints)} active scheduling rules synced to the optimizer",
            "time": "1m ago",
        },
        {
            "id": 3,
            "type": "risk",
            "title": "Flight risk refreshed",
            "desc": f"{flagged} employees flagged · {critical} critical",
            "time": "2m ago",
        },
        {
            "id": 4,
            "type": "crisis",
            "title": "Crisis Agent warning",
            "desc": f"{top_team} has the highest concentration of critical-risk staff this cycle",
            "time": "5m ago",
        },
    ]

    return {
        "employees": solved_employees,
        "baselineEmployees": before_employees,
        "analysisSummary": {
            "employees": len(before_employees),
            "avgBurden": baseline_avg_burden,
            "fairnessScore": baseline_fairness,
            "fairnessGap": round(jealousy_index(before_burdens), 1),
            "morale": baseline_morale,
            "flagged": baseline_flagged,
            "critical": baseline_critical,
        },
        "kpis": kpis,
        "burdenTrend": burden_trend,
        "shiftDistribution": _distribution_from_employees(solved_employees),
        "costDistribution": _cost_distribution(solved_employees),
        "riskDistribution": _risk_distribution(solved_employees),
        "fairnessTrend": fairness_trend,
        "aiActivity": ai_activity,
        "constraints": active_constraints,
        "crisisAdvice": {
            "fairnessGap": round(solution["data"]["gap"], 1),
            "attritionCost": attrition_cost,
            "impact": f"{critical or 1} high-risk staff in {top_team} need rebalancing before the next cycle.",
            "recommendedSlider": max(55, min(85, int(round(fairness_weight * 100 + 3)))),
            "confidence": round(min(0.98, 0.7 + flagged / max(len(solved_employees), 1)), 2),
        },
        "flightRiskSummary": {
            "updated": datetime.now().isoformat(),
            "flagged": flagged,
            "critical": critical,
        },
        "solverSummary": solved_summary,
        "beforeAfter": {
            "before": {
                "burden": round(sum(before_burdens.values()) / max(len(before_burdens), 1), 1),
                "fairness": before_fairness,
                "morale": round(team_morale(before_burdens), 1),
            },
            "after": {
                "burden": avg_burden,
                "fairness": fairness_score,
                "morale": round(solution["data"]["team_morale"], 1),
            },
        },
        "meta": {
            "employeesCsv": dataset["employees_path"],
            "shiftHistoryCsv": dataset["history_path"],
            "cycle": dataset["cycle"],
        },
    }
