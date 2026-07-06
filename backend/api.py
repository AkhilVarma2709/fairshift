from __future__ import annotations

import csv
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from dashboard_service import (
    DEFAULT_EMPLOYEES_CSV,
    DEFAULT_SHIFT_HISTORY_CSV,
    build_dashboard_snapshot,
    parse_constraint_text,
)


app = Flask(__name__)
CORS(app)

UPLOADS_DIR = Path(__file__).resolve().parent / ".uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
ACTIVE_DATASET = {
    "employees_csv": DEFAULT_EMPLOYEES_CSV,
    "shift_history_csv": DEFAULT_SHIFT_HISTORY_CSV,
}


def _dataset_paths() -> tuple[Path, Path]:
    return ACTIVE_DATASET["employees_csv"], ACTIVE_DATASET["shift_history_csv"]


def _save_upload(file_storage, filename: str) -> Path:
    destination = UPLOADS_DIR / filename
    file_storage.save(destination)
    return destination


@app.get("/api/health")
def health() -> tuple[dict, int]:
    return {"ok": True}, 200


@app.get("/api/dashboard")
def dashboard():
    fairness_weight = float(request.args.get("fairnessWeight", 65))
    min_work_days = int(request.args.get("minWorkDays", 0))
    max_work_days = int(request.args.get("maxWorkDays", 7))
    employees_csv, shift_history_csv = _dataset_paths()
    snapshot = build_dashboard_snapshot(
        fairness_weight=fairness_weight / 100.0,
        employees_csv=employees_csv,
        shift_history_csv=shift_history_csv,
        min_work_days=min_work_days,
        max_work_days=max_work_days,
    )
    return jsonify({"ok": True, "dashboard": snapshot})


@app.post("/api/solve")
def solve():
    payload = request.get_json(silent=True) or {}
    fairness_weight = float(payload.get("fairnessWeight", 65)) / 100.0
    constraints = payload.get("constraints")
    min_work_days = int(payload.get("minWorkDays", 0))
    max_work_days = int(payload.get("maxWorkDays", 7))
    employees_csv, shift_history_csv = _dataset_paths()
    snapshot = build_dashboard_snapshot(
        fairness_weight=fairness_weight,
        constraints=constraints,
        employees_csv=employees_csv,
        shift_history_csv=shift_history_csv,
        min_work_days=min_work_days,
        max_work_days=max_work_days,
    )
    return jsonify({"ok": True, "summary": snapshot["solverSummary"], "dashboard": snapshot})


@app.get("/api/flight-risk")
def flight_risk():
    employees_csv, shift_history_csv = _dataset_paths()
    snapshot = build_dashboard_snapshot(employees_csv=employees_csv, shift_history_csv=shift_history_csv)
    return jsonify({"ok": True, **snapshot["flightRiskSummary"]})


@app.get("/api/crisis-advice")
def crisis_advice():
    employees_csv, shift_history_csv = _dataset_paths()
    snapshot = build_dashboard_snapshot(employees_csv=employees_csv, shift_history_csv=shift_history_csv)
    return jsonify({"ok": True, **snapshot["crisisAdvice"]})


@app.post("/api/parse-constraint")
def parse_constraint():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()
    parsed = parse_constraint_text(text)
    return jsonify({"ok": True, "parsed": [parsed]})


@app.post("/api/upload-dataset")
def upload_dataset():
    employees_file = request.files.get("employeesFile")
    history_file = request.files.get("historyFile")

    if (
        (employees_file is None or not employees_file.filename)
        and (history_file is None or not history_file.filename)
    ):
        return jsonify({"ok": False, "message": "Upload at least one CSV file"}), 400

    previous = ACTIVE_DATASET.copy()
    uploaded = {}
    if employees_file is not None and employees_file.filename:
        employees_path = _save_upload(employees_file, "employees.csv")
        ACTIVE_DATASET["employees_csv"] = employees_path
        uploaded["employees"] = employees_file.filename

    if history_file is not None and history_file.filename:
        history_path = _save_upload(history_file, "shift_history.csv")
        ACTIVE_DATASET["shift_history_csv"] = history_path
        uploaded["shiftHistory"] = history_file.filename

    employees_csv, shift_history_csv = _dataset_paths()

    try:
        snapshot = build_dashboard_snapshot(
            employees_csv=employees_csv,
            shift_history_csv=shift_history_csv,
        )
    except Exception as exc:
        ACTIVE_DATASET.update(previous)
        return jsonify({"ok": False, "message": str(exc)}), 400

    row_counts = {}
    for key, path in (("employees", employees_csv), ("shiftHistory", shift_history_csv)):
        with path.open(newline="") as handle:
            reader = csv.reader(handle)
            rows = list(reader)
        row_counts[key] = max(len(rows) - 1, 0)

    return jsonify(
        {
            "ok": True,
            "uploaded": uploaded,
            "rows": row_counts,
            "dashboard": snapshot,
        }
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
