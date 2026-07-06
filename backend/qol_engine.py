"""
FairGuard — Layer 1: QoL (Quality of Life) Scoring Engine
-----------------------------------------------------------
Computes a burden score for an employee from raw shift history,
using exponential time decay so recent pain counts more than old pain.

This is a PRE-PROCESSING step. If historical_burden is already supplied
(per PRD Contract A), skip this module entirely — it exists so the
number in Contract A isn't a black box, and so you can compute it
yourself once you have real attendance logs.

Formula (from the math spec):
    QoL_i = 100 - sum( W_type * D_age )
    D_age = e^(-lambda * days_ago)

We report BURDEN, not QoL, to match the PRD's `historical_burden` field
(higher = more burnt out). Burden = 100 - QoL.
"""

import math
from dataclasses import dataclass
from datetime import date


# ---- Pain weights (points subtracted from QoL per shift) -----------------
PAIN_WEIGHTS = {
    "day": 1,
    "morning": 1,       # alias — MVP shift naming uses "Morning"
    "evening": 3,
    "night": 15,
}
WEEKEND_EXTRA = 10       # added if the shift falls on Sat/Sun
HOLIDAY_EXTRA = 20       # added if the shift falls on a flagged public holiday
TOXIC_PROJECT_EXTRA = 5  # added if the shift is flagged high-stress

DEFAULT_LAMBDA = 0.1     # ~7-day half-life. See note below.

# Calibration note: the spec's original example (lambda=0.03) was
# illustrative for a SINGLE old shift, not a sum over 90 days of a real
# roster. At 0.03, anyone working a normal 3+ shifts/week rotation
# accumulates enough undecayed pain to clamp the score at 100 well
# before 90 days is up — the score stops differentiating people.
# lambda=0.1 gives a ~7-day half-life (e^-0.1*7 ≈ 0.50): a shift's pain
# is halved after a week, ~5% remains after a month. That keeps the
# effective memory window to roughly 3-4 weeks, which is what "recovery"
# should mean in practice, and produces a usable 0-100 spread over a
# real 90-day log. Re-tune against your actual attendance data — the
# right half-life depends on your industry's real recovery time, not
# a formula.


@dataclass
class ShiftRecord:
    """One historical shift an employee actually worked."""
    shift_type: str          # "morning" | "evening" | "night"
    worked_on: date
    is_weekend: bool = False
    is_holiday: bool = False
    is_toxic_project: bool = False


def time_decay(days_ago: int, lam: float = DEFAULT_LAMBDA) -> float:
    """D_age = e^(-lambda * days_ago). 1.0 = happened today, ->0 as it ages."""
    return math.exp(-lam * max(days_ago, 0))


def shift_pain(shift: ShiftRecord) -> float:
    """W_type for a single shift, before decay is applied."""
    w = PAIN_WEIGHTS.get(shift.shift_type.lower(), 1)
    if shift.is_weekend:
        w += WEEKEND_EXTRA
    if shift.is_holiday:
        w += HOLIDAY_EXTRA
    if shift.is_toxic_project:
        w += TOXIC_PROJECT_EXTRA
    return w


def compute_burden(history: list[ShiftRecord], as_of: date, lam: float = DEFAULT_LAMBDA) -> float:
    """
    Rolls an employee's last-90-days shift history into a single burden
    score on a 0-100 scale (clamped). This is what you'd store as
    `historical_burden` in Contract A once you have real logs.
    """
    total_pain = 0.0
    for s in history:
        days_ago = (as_of - s.worked_on).days
        total_pain += shift_pain(s) * time_decay(days_ago, lam)

    qol = 100.0 - total_pain
    burden = 100.0 - qol          # = total_pain, kept explicit for clarity
    return max(0.0, min(100.0, burden))


if __name__ == "__main__":
    # Sanity check at the new default lambda (0.1, ~7-day half-life):
    # night shift 30 days ago -> ~5% pain left; night shift yesterday -> ~90%.
    today = date(2026, 7, 4)
    hist = [
        ShiftRecord("night", date(2026, 6, 4)),   # 30 days ago
        ShiftRecord("night", date(2026, 7, 3)),   # yesterday
    ]
    print("Decay(30d):", round(time_decay(30), 3))   # ~0.050
    print("Decay(1d):", round(time_decay(1), 3))     # ~0.905
    print("Burden:", round(compute_burden(hist, today), 2))