"""
FairGuard — Layer 2/3: Fairness Metrics + Pareto Frontier
-----------------------------------------------------------
Layer 2: the Jealousy Index. We minimize the RANGE (max - min), not
variance — range is linear, which CP-SAT (an integer/linear solver)
handles natively. Variance is quadratic and turns a fast problem slow.

Layer 3: the dual objective. Cost and fairness conflict, so we run
the solver three times at three weight settings and hand back all
three schedules. This IS the demo: show the judge the "evil" schedule,
the "expensive" schedule, and the Pareto-optimal one FairGuard picks.
"""

from dataclasses import dataclass


def jealousy_index(burden_scores: dict) -> float:
    """Z = QoL_max - QoL_min, applied to burden scores (same range either way)."""
    if not burden_scores:
        return 0.0
    values = list(burden_scores.values())
    return max(values) - min(values)


def team_morale(burden_scores: dict) -> float:
    """PRD contract: team_morale = 100 - gap."""
    return round(100.0 - jealousy_index(burden_scores), 1)


@dataclass
class ParetoPoint:
    label: str
    alpha: float   # cost weight
    beta: float    # fairness weight
    result: dict   # raw solver output for this run


def run_pareto_frontier(solve_fn, request: dict) -> list[ParetoPoint]:
    """
    Runs the solver 3x to produce the three reference points from the
    math spec:
      Run 1 — Efficiency  (alpha=1.0, beta=0.0): cheapest, most unfair.
      Run 2 — Fairness    (alpha=0.0, beta=1.0): fairest, most expensive.
      Run 3 — Nash point  (alpha=0.6, beta=0.4): what FairGuard recommends.

    `solve_fn` is solver.solve_schedule — passed in to avoid a circular
    import between fairness.py and solver.py.
    """
    settings = [
        ("Efficiency (evil schedule)", 1.0, 0.0),
        ("Fairness (expensive schedule)", 0.0, 1.0),
        ("Nash Bargaining (recommended)", 0.6, 0.4),
    ]
    points = []
    for label, alpha, beta in settings:
        req = dict(request)
        req["_alpha_override"] = alpha
        req["_beta_override"] = beta
        result = solve_fn(req)
        points.append(ParetoPoint(label=label, alpha=alpha, beta=beta, result=result))
    return points


def summarize_pareto(points: list[ParetoPoint]) -> str:
    lines = ["Run                              Cost      Gap    Morale"]
    for p in points:
        d = p.result.get("data", {})
        cost = d.get("total_cost", "n/a")
        gap = d.get("gap", "n/a")
        morale = d.get("team_morale", "n/a")
        lines.append(f"{p.label:<32}  {cost!s:<8}  {gap!s:<6}  {morale!s}")
    return "\n".join(lines)