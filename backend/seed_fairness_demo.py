"""
CrisisForge AI — Fairness Demo Seed Script
Generates realistic AllocationLog entries with rural/urban disparities
so the FairnessMeter gauge moves and shows non-trivial readings.

Usage (from backend/):
    source venv/bin/activate
    python seed_fairness_demo.py
"""

import random
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import AllocationLog, FairnessMetric

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

HOSPITALS = [
    "City General Hospital",
    "Metro Medical Center",
    "Eastside Trauma Unit",
    "Westfield Community Hospital",
    "Northgate Clinic",
    "Riverside Emergency Center",
]

PHYSICIANS = ["Dr. Patel", "Dr. Kim", "Dr. Singh", "Dr. Chen", "Dr. Rodriguez", "Dr. Okafor"]

random.seed(42)


def make_log(i: int, origin: str, session) -> AllocationLog:
    """Create one realistic AllocationLog row."""
    # Rural patients get artificially longer wait times to simulate disparity
    if origin == "rural":
        wait = round(random.uniform(45, 120), 1)
    else:
        wait = round(random.uniform(10, 50), 1)

    severity = round(random.uniform(3.0, 9.5), 1)
    transfer_count = random.choices([0, 1, 2], weights=[0.6, 0.3, 0.1])[0]

    log = AllocationLog(
        patient_id=f"PT-{1000 + i:04d}",
        source_hospital=random.choice(HOSPITALS),
        dest_hospital=random.choice(HOSPITALS),
        timestamp=datetime.utcnow() - timedelta(minutes=random.randint(0, 60 * 24)),
        severity_score=severity,
        patient_origin=origin,
        referring_physician=random.choice(PHYSICIANS),
        wait_time_minutes=wait,
        transfer_count=transfer_count,
    )
    return log


def seed(n_rural: int = 60, n_urban: int = 40):
    db = SessionLocal()
    try:
        existing = db.query(AllocationLog).count()
        if existing > 0:
            print(f"[seed] Found {existing} existing rows — skipping insert.")
            return

        rows = []
        for i in range(n_rural):
            rows.append(make_log(i, "rural", db))
        for i in range(n_urban):
            rows.append(make_log(n_rural + i, "urban", db))

        db.add_all(rows)
        db.commit()
        print(f"[seed] Inserted {len(rows)} allocation logs ({n_rural} rural, {n_urban} urban).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("[seed] Done. Visit http://localhost:8000/api/fairness/score to verify.")
