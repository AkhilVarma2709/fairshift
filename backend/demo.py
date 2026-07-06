"""
FairGuard — Demo Runner
-----------------------------------------------------------
Run this tonight: `python demo.py`

Uses the exact sample data from the PRD (Contract A/B examples) and
prints:
  1. A single /solve call at fairness_weight=0.7 (Contract B shape).
  2. The full Pareto frontier (Efficiency / Fairness / Nash) so you
     can show the judge all three schedules side by side.
"""

import json

from solver import solve_schedule
from fairness import run_pareto_frontier, summarize_pareto, jealousy_index, team_morale

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
SHIFT_TYPES = ["Morning", "Evening", "Night"]
ALL_SHIFTS = [f"{d}_{t}" for d in DAYS for t in SHIFT_TYPES]

SAMPLE_REQUEST = {
    "employees": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    "historical_burden": {
        "Alice": 50.0, "Bob": 20.0, "Charlie": 85.0, "Diana": 60.0, "Eve": 30.0,
    },
    "hourly_rate": {
        "Alice": 50, "Bob": 50, "Charlie": 30, "Diana": 30, "Eve": 30,
    },
    "shifts": ALL_SHIFTS,
    "blackouts": {
        "Charlie": ["Night", "Evening"],
    },
    "preferences": {
        "Alice": ["Morning"],
        "Bob": ["Evening"],
    },
    "fairness_weight": 0.7,
}


def main():
    print("=" * 70)
    print("SINGLE SOLVE — Contract B response (fairness_weight = 0.7)")
    print("=" * 70)
    result = solve_schedule(SAMPLE_REQUEST)
    print(json.dumps(result, indent=2))

    if result["status"] != "optimal":
        return

    print()
    print("=" * 70)
    print("PARETO FRONTIER — Efficiency vs. Fairness vs. Nash point")
    print("=" * 70)
    points = run_pareto_frontier(solve_schedule, SAMPLE_REQUEST)
    print(summarize_pareto(points))
    print()
    print("This table IS the demo. Show the judge all three rows.")


if __name__ == "__main__":
    main()