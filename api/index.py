from __future__ import annotations

import csv
from typing import Any

from flask import Flask, jsonify, request

from backend.dashboard_service import build_dashboard_snapshot, parse_constraint_text


app = Flask(__name__)


def _dataset_kwargs_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    dataset = payload.get("dataset") or {}
    employees_csv_text = str(dataset.get("employeesCsvText") or "").strip()
    shift_history_csv_text = str(dataset.get("shiftHistoryCsvText") or "").strip()
    employees_filename = str(dataset.get("employeesFilename") or "uploaded:employees.csv")
    shift_history_filename = str(dataset.get("shiftHistoryFilename") or "uploaded:shift_history.csv")

    if employees_csv_text and shift_history_csv_text:
        return {
            "employees_csv_text": employees_csv_text,
            "shift_history_csv_text": shift_history_csv_text,
            "employees_label": employees_filename,
            "shift_history_label": shift_history_filename,
        }
    return {}


def _read_uploaded_text(field_name: str) -> tuple[str, str] | tuple[None, None]:
    file_storage = request.files.get(field_name)
    if file_storage is None or not file_storage.filename:
        return None, None

    text = file_storage.stream.read().decode("utf-8-sig")
    return text, file_storage.filename


def _row_count(csv_text: str) -> int:
    reader = csv.reader(csv_text.splitlines())
    rows = list(reader)
    return max(len(rows) - 1, 0)


@app.get("/api/health")
def health() -> tuple[dict[str, bool], int]:
    return {"ok": True}, 200


@app.get("/api/dashboard")
def dashboard_get():
    snapshot = build_dashboard_snapshot()
    return jsonify({"ok": True, "dashboard": snapshot})


@app.post("/api/dashboard")
def dashboard_post():
    payload = request.get_json(silent=True) or {}
    fairness_weight = float(payload.get("fairnessWeight", 65))
    min_work_days = int(payload.get("minWorkDays", 0))
    max_work_days = int(payload.get("maxWorkDays", 7))

    snapshot = build_dashboard_snapshot(
        fairness_weight=fairness_weight / 100.0,
        min_work_days=min_work_days,
        max_work_days=max_work_days,
        **_dataset_kwargs_from_payload(payload),
    )
    return jsonify({"ok": True, "dashboard": snapshot})


@app.post("/api/solve")
def solve():
    payload = request.get_json(silent=True) or {}
    fairness_weight = float(payload.get("fairnessWeight", 65)) / 100.0
    constraints = payload.get("constraints")
    min_work_days = int(payload.get("minWorkDays", 0))
    max_work_days = int(payload.get("maxWorkDays", 7))

    snapshot = build_dashboard_snapshot(
        fairness_weight=fairness_weight,
        constraints=constraints,
        min_work_days=min_work_days,
        max_work_days=max_work_days,
        **_dataset_kwargs_from_payload(payload),
    )
    return jsonify({"ok": True, "summary": snapshot["solverSummary"], "dashboard": snapshot})


@app.get("/api/flight-risk")
def flight_risk():
    snapshot = build_dashboard_snapshot()
    return jsonify({"ok": True, **snapshot["flightRiskSummary"]})


@app.get("/api/crisis-advice")
def crisis_advice():
    snapshot = build_dashboard_snapshot()
    return jsonify({"ok": True, **snapshot["crisisAdvice"]})


@app.post("/api/parse-constraint")
def parse_constraint():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()
    parsed = parse_constraint_text(text)
    return jsonify({"ok": True, "parsed": [parsed]})


@app.post("/api/upload-dataset")
def upload_dataset():
    employees_text, employees_filename = _read_uploaded_text("employeesFile")
    history_text, history_filename = _read_uploaded_text("historyFile")

    current_employees_text = str(request.form.get("currentEmployeesCsvText") or "").strip()
    current_history_text = str(request.form.get("currentShiftHistoryCsvText") or "").strip()
    current_employees_filename = str(request.form.get("currentEmployeesFilename") or "uploaded:employees.csv")
    current_history_filename = str(request.form.get("currentShiftHistoryFilename") or "uploaded:shift_history.csv")

    resolved_employees_text = employees_text or current_employees_text
    resolved_history_text = history_text or current_history_text
    resolved_employees_filename = employees_filename or current_employees_filename
    resolved_history_filename = history_filename or current_history_filename

    if not resolved_employees_text or not resolved_history_text:
        return jsonify({"ok": False, "message": "Upload both CSVs the first time, or keep one from the current dataset."}), 400

    try:
        snapshot = build_dashboard_snapshot(
            employees_csv_text=resolved_employees_text,
            shift_history_csv_text=resolved_history_text,
            employees_label=resolved_employees_filename,
            shift_history_label=resolved_history_filename,
        )
    except Exception as exc:
        return jsonify({"ok": False, "message": str(exc)}), 400

    return jsonify(
        {
            "ok": True,
            "uploaded": {
                "employees": employees_filename,
                "shiftHistory": history_filename,
            },
            "rows": {
                "employees": _row_count(resolved_employees_text),
                "shiftHistory": _row_count(resolved_history_text),
            },
            "dataset": {
                "employeesCsvText": resolved_employees_text,
                "shiftHistoryCsvText": resolved_history_text,
                "employeesFilename": resolved_employees_filename,
                "shiftHistoryFilename": resolved_history_filename,
            },
            "dashboard": snapshot,
        }
    )
