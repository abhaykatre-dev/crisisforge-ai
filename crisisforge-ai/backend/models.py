"""
CrisisForge AI — Fairness Engine ORM Models
AllocationLog: records each patient allocation decision.
FairnessMetric: stores daily aggregated fairness metrics.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from database import Base


class AllocationLog(Base):
    __tablename__ = "allocation_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=False, index=True)
    source_hospital = Column(String, nullable=False)
    dest_hospital = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    severity_score = Column(Float, nullable=False)
    patient_origin = Column(String, default="urban")   # "rural" or "urban"
    referring_physician = Column(String, default="unknown")
    wait_time_minutes = Column(Float, default=0.0)
    transfer_count = Column(Integer, default=0)


class FairnessMetric(Base):
    __tablename__ = "fairness_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    rural_vs_urban_wait_ratio = Column(Float, default=1.0)
    transfer_disparity_score = Column(Float, default=0.0)
    overall_fairness_score = Column(Float, default=1.0)
