"""
RoadGuard AI – Predictive Maintenance Module
=============================================
Uses historical damage data + (optional) weather trends to predict
road segments likely to degrade in the next 30 days.

Algorithm
---------
1. Cluster existing damage reports by GPS proximity (0.01° grid cells).
2. For each cell, compute a degradation_risk score:
     risk = avg_severity × recency_factor × repair_lag_factor
3. Return cells whose risk exceeds a configurable threshold.

This is intentionally lightweight – no external ML library needed.
Replace with a proper time-series or ML model when production data is available.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List


def predict_maintenance(
    damage_reports: List[Dict[str, Any]],
    threshold: float = 40.0,
    grid_size: float = 0.01,
) -> List[Dict[str, Any]]:
    """
    Predict road segments at risk of degradation in the next 30 days.

    Args:
        damage_reports: List of dicts with keys:
                          latitude, longitude, severity_score,
                          repair_status, timestamp (ISO string or datetime)
        threshold:      Minimum risk score to include in predictions (0-100).
        grid_size:      Lat/lng grid resolution in degrees (~1 km at equator).

    Returns:
        List of risk segments sorted by risk descending:
          { lat_cell, lng_cell, risk_score, report_count, avg_severity }
    """
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    cells: Dict[str, Dict[str, Any]] = {}

    for report in damage_reports:
        # Skip already-repaired segments
        if report.get("repair_status") == "repaired":
            continue

        lat = round(float(report["latitude"]) / grid_size) * grid_size
        lng = round(float(report["longitude"]) / grid_size) * grid_size
        cell_key = f"{lat:.4f},{lng:.4f}"

        # Parse timestamp
        ts = report.get("timestamp") or report.get("createdAt")
        if isinstance(ts, str):
            try:
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except ValueError:
                ts = now
        elif ts is None:
            ts = now

        age_days = max((now - ts.replace(tzinfo=None)).days, 0)

        severity = float(report.get("severity_score", 0))

        if cell_key not in cells:
            cells[cell_key] = {
                "lat_cell": lat,
                "lng_cell": lng,
                "severities": [],
                "ages": [],
                "repair_statuses": [],
            }

        cells[cell_key]["severities"].append(severity)
        cells[cell_key]["ages"].append(age_days)
        cells[cell_key]["repair_statuses"].append(report.get("repair_status", "pending"))

    predictions = []
    for data in cells.values():
        avg_severity = sum(data["severities"]) / len(data["severities"])
        avg_age = sum(data["ages"]) / len(data["ages"])
        pending_count = data["repair_statuses"].count("pending")
        report_count = len(data["severities"])

        # Recency factor: older unresolved damage scores higher (more urgent)
        recency_factor = min(avg_age / 30.0, 2.0)  # caps at 2×

        # Repair-lag penalty: many pending reports → higher risk
        lag_factor = 1.0 + (pending_count / max(report_count, 1)) * 0.5

        risk_score = min(avg_severity * recency_factor * lag_factor, 100.0)

        if risk_score >= threshold:
            predictions.append(
                {
                    "lat_cell": data["lat_cell"],
                    "lng_cell": data["lng_cell"],
                    "risk_score": round(risk_score, 1),
                    "report_count": report_count,
                    "avg_severity": round(avg_severity, 1),
                    "estimated_degradation_date": (
                        now + timedelta(days=max(30 - int(avg_age), 1))
                    ).strftime("%Y-%m-%d"),
                }
            )

    return sorted(predictions, key=lambda p: p["risk_score"], reverse=True)
