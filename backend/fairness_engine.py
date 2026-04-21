"""
CrisisForge AI — FairFlow Fairness Engine
Calculates allocation fairness, audits bias, and enforces ethical constraints.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models import AllocationLog, FairnessMetric


# ─── Core Scoring ───────────────────────────────────────────────

def calculate_fairness_score(allocation_logs: List[AllocationLog]) -> float:
    """
    Compute an overall fairness score (0.0 → 1.0) based on rural/urban
    wait-time parity.  A score of 1.0 means perfect equity; lower means
    rural patients are waiting disproportionately longer.
    """
    if not allocation_logs:
        return 1.0

    rural_waits  = [log.wait_time_minutes for log in allocation_logs if log.patient_origin == "rural"]
    urban_waits  = [log.wait_time_minutes for log in allocation_logs if log.patient_origin == "urban"]

    avg_rural = sum(rural_waits) / len(rural_waits) if rural_waits else 0.0
    avg_urban = sum(urban_waits) / len(urban_waits) if urban_waits else 0.0

    if avg_urban == 0:
        return 1.0  # No urban data → assume fair

    ratio = avg_rural / avg_urban  # ideal = 1.0

    # Score: penalise any ratio above 1 (rural waiting longer)
    if ratio <= 1.0:
        return 1.0
    else:
        # Clamp: if rural waits 3× longer → score 0
        return max(0.0, round(1.0 - (ratio - 1.0) / 2.0, 4))


# ─── Bias Audit ─────────────────────────────────────────────────

def audit_bias(db: Session) -> Dict:
    """
    Query the last 100 allocation logs and return a detailed disparity report.
    """
    logs = (
        db.query(AllocationLog)
        .order_by(AllocationLog.timestamp.desc())
        .limit(100)
        .all()
    )

    if not logs:
        return {
            "status": "no_data",
            "message": "No allocation logs found. Run seed_fairness_demo.py to generate sample data.",
            "records_analysed": 0,
        }

    rural_logs = [l for l in logs if l.patient_origin == "rural"]
    urban_logs = [l for l in logs if l.patient_origin == "urban"]

    avg_rural_wait = round(sum(l.wait_time_minutes for l in rural_logs) / max(len(rural_logs), 1), 2)
    avg_urban_wait = round(sum(l.wait_time_minutes for l in urban_logs) / max(len(urban_logs), 1), 2)

    rural_multi_transfer = sum(1 for l in rural_logs if l.transfer_count > 1)
    urban_multi_transfer = sum(1 for l in urban_logs if l.transfer_count > 1)

    avg_rural_severity = round(sum(l.severity_score for l in rural_logs) / max(len(rural_logs), 1), 2)
    avg_urban_severity = round(sum(l.severity_score for l in urban_logs) / max(len(urban_logs), 1), 2)

    fairness_score = calculate_fairness_score(logs)

    return {
        "records_analysed": len(logs),
        "fairness_score": fairness_score,
        "rural_patients": len(rural_logs),
        "urban_patients": len(urban_logs),
        "avg_wait_rural_min": avg_rural_wait,
        "avg_wait_urban_min": avg_urban_wait,
        "rural_vs_urban_wait_ratio": round(avg_rural_wait / max(avg_urban_wait, 0.01), 3),
        "avg_severity_rural": avg_rural_severity,
        "avg_severity_urban": avg_urban_severity,
        "multi_transfer_rural": rural_multi_transfer,
        "multi_transfer_urban": urban_multi_transfer,
        "transfer_disparity": round(
            rural_multi_transfer / max(len(rural_logs), 1) -
            urban_multi_transfer / max(len(urban_logs), 1),
            4,
        ),
        "generated_at": datetime.utcnow().isoformat(),
    }


# ─── Ethical Constraint Check ───────────────────────────────────

def ethical_constraint_check(patient: Dict, target_hospital: Dict) -> Dict:
    """
    Enforce ethical allocation constraints.
    Returns a dict with `allowed` (bool) and a list of `violations`.

    Rules:
    1. No patient may be transferred more than 2 times.
    2. ICU placement requires severity_score >= 7.
    3. Rural patients receive same or higher priority level (no demotion).
    """
    violations: List[str] = []

    # Rule 1 — transfer count cap
    transfer_count = patient.get("transfer_count", 0)
    if transfer_count >= 2:
        violations.append(
            f"Patient has already been transferred {transfer_count} times. "
            "Max 2 transfers allowed."
        )

    # Rule 2 — ICU severity gate
    needs_icu = patient.get("needs_icu", False)
    severity = patient.get("severity_score", 0)
    if needs_icu and severity < 7:
        violations.append(
            f"ICU placement requires severity_score >= 7 (patient has {severity}). "
            "Consider general ward instead."
        )

    # Rule 3 — rural priority parity
    origin = patient.get("patient_origin", "urban")
    hospital_rural_priority = target_hospital.get("rural_priority", True)
    if origin == "rural" and not hospital_rural_priority:
        violations.append(
            "Target hospital has rural_priority=False. "
            "Rural patients must receive equal access — choose a different facility."
        )

    return {
        "allowed": len(violations) == 0,
        "violations": violations,
        "patient_id": patient.get("patient_id", "unknown"),
        "target_hospital": target_hospital.get("name", "unknown"),
        "checked_at": datetime.utcnow().isoformat(),
    }


# ─── Current Score Helper ────────────────────────────────────────

def get_current_fairness_score(db: Session) -> Dict:
    """
    Return the most recently computed fairness score (last 24 h of logs).
    """
    since = datetime.utcnow() - timedelta(hours=24)
    logs = (
        db.query(AllocationLog)
        .filter(AllocationLog.timestamp >= since)
        .order_by(AllocationLog.timestamp.desc())
        .limit(200)
        .all()
    )

    score = calculate_fairness_score(logs)

    rural_logs = [l for l in logs if l.patient_origin == "rural"]
    urban_logs = [l for l in logs if l.patient_origin == "urban"]
    avg_rural  = round(sum(l.wait_time_minutes for l in rural_logs) / max(len(rural_logs), 1), 2)
    avg_urban  = round(sum(l.wait_time_minutes for l in urban_logs) / max(len(urban_logs), 1), 2)

    return {
        "overall_fairness_score": score,
        "rural_vs_urban_wait_ratio": round(avg_rural / max(avg_urban, 0.01), 3),
        "avg_rural_wait_min": avg_rural,
        "avg_urban_wait_min": avg_urban,
        "records_in_window": len(logs),
        "window_hours": 24,
        "computed_at": datetime.utcnow().isoformat(),
    }
