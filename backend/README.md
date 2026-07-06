# FairGuard Solver (Member 1)

Four files. Each maps to one math layer from the spec.

| File | Layer | What it does |
|---|---|---|
| `qol_engine.py` | 1 | Exponential-decay burden score from raw shift history. Optional — skip if `historical_burden` is already in your CSV. |
| `fairness.py` | 2/3 | Jealousy Index (`max - min`, not variance) + the 3-run Pareto frontier. |
| `solver.py` | 4 | CP-SAT model. `solve_schedule(request)` is the ONLY function the API needs to call. It takes Contract B's request dict and returns Contract B's response dict — no other fields, no renaming. |
| `demo.py` | — | Runs the PRD sample data. `python demo.py`. |

## Install
```bash
pip install -r requirements.txt --break-system-packages
```

## Run
```bash
python demo.py
```

## What M3 (API) needs to know
Call exactly this:
```python
from solver import solve_schedule
result = solve_schedule(request_dict)   # request_dict = Contract B body, verbatim
```
`result` is already shaped as Contract B's response — `status`, then either
`data` (optimal) or `message` + `suggestion` (infeasible). Return it as-is.
Don't touch the keys.

## What M2 (Frontend) needs to know
`burden_scores` values are floats, one decimal place, 0-100 scale — feed
directly into the heatmap color thresholds already spec'd (Red >70,
Yellow 40-70, Green <40). `gap` and `team_morale` are already computed;
don't recalculate them client-side.

## Known limitation — read before demo night
The fairness/cost trade-off saturates around `fairness_weight ≈ 0.7` on
a 5-employee dataset — beyond that the gap can't shrink further because
shift coverage is discrete (integer shifts, not fractional hours). This
is real solver behavior, not a bug. If a judge drags the slider to 100%
and nothing changes past 70%, say exactly that: *"we've hit the
mathematical floor for this team size — the schedule is already as fair
as physically possible."* That's a stronger answer than pretending it
keeps improving.

## Tunable constants (top of `solver.py`)
`PAIN_X10`, `WEEKEND_EXTRA_X10`, `WEEKLY_BURDEN_ROLLOVER`, `PREF_PENALTY`,
`OBJECTIVE_SCALE`. These are defensible starting points from the math
spec, not calibrated against your real dataset. Run `demo.py` against
your actual CSV tonight and eyeball whether the schedules look sane —
adjust these five constants if not. Don't ship them unexamined.