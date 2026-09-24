"""
Data-to-Decision OS — Database Models
All SQLAlchemy models for the platform.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Text, Boolean,
    JSON, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


# ─── Enums ───────────────────────────────────────────────

class PipelineStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class DataQualityLevel(str, enum.Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"


class DecisionStatus(str, enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    EXECUTED = "executed"
    EVALUATED = "evaluated"


# ─── Data Engineering ────────────────────────────────────

class Dataset(Base):
    """Ingested datasets."""
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), default="csv")  # csv, json, api
    file_path = Column(Text, nullable=True)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    columns_metadata = Column(JSON, default=dict)
    size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    quality_reports = relationship("QualityReport", back_populates="dataset")
    pipelines = relationship("Pipeline", back_populates="dataset")


class Pipeline(Base):
    """ETL/ELT pipeline runs."""
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    status = Column(SQLEnum(PipelineStatus), default=PipelineStatus.PENDING)
    steps = Column(JSON, default=list)  # List of pipeline step results
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dataset = relationship("Dataset", back_populates="pipelines")


# ─── Data Quality ────────────────────────────────────────

class QualityReport(Base):
    """Data quality validation reports."""
    __tablename__ = "quality_reports"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    overall_score = Column(Float, default=0.0)  # 0-100
    level = Column(SQLEnum(DataQualityLevel), default=DataQualityLevel.GOOD)
    checks = Column(JSON, default=list)  # List of check results
    null_summary = Column(JSON, default=dict)
    duplicate_count = Column(Integer, default=0)
    anomaly_count = Column(Integer, default=0)
    schema_valid = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dataset = relationship("Dataset", back_populates="quality_reports")


# ─── Analytics ───────────────────────────────────────────

class AnalyticsSnapshot(Base):
    """Statistical analysis snapshots."""
    __tablename__ = "analytics_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    summary_stats = Column(JSON, default=dict)
    correlations = Column(JSON, default=dict)
    distributions = Column(JSON, default=dict)
    trends = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── BI / KPIs ───────────────────────────────────────────

class KPI(Base):
    """Key Performance Indicators."""
    __tablename__ = "kpis"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    value = Column(Float, nullable=False)
    previous_value = Column(Float, nullable=True)
    unit = Column(String(50), default="")
    category = Column(String(100), default="general")
    trend = Column(String(20), default="stable")  # up, down, stable
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── ML Engineering ──────────────────────────────────────

class MLModel(Base):
    """Trained ML models."""
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    version = Column(String(50), default="1.0.0")
    algorithm = Column(String(100), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    target_column = Column(String(255), nullable=True)
    feature_columns = Column(JSON, default=list)
    hyperparameters = Column(JSON, default=dict)
    metrics = Column(JSON, default=dict)  # accuracy, rmse, etc.
    model_path = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    predictions = relationship("Prediction", back_populates="model")


class Prediction(Base):
    """Model predictions."""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"))
    input_data = Column(JSON, default=dict)
    prediction_value = Column(Float, nullable=True)
    prediction_label = Column(String(255), nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    model = relationship("MLModel", back_populates="predictions")


# ─── MLOps ───────────────────────────────────────────────

class ModelMetric(Base):
    """Model performance metrics over time (monitoring)."""
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"))
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    drift_detected = Column(Boolean, default=False)
    drift_score = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── Decision Engine ─────────────────────────────────────

class Decision(Base):
    """Decisions generated from predictions."""
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="general")
    confidence = Column(Float, default=0.0)
    impact_estimate = Column(Float, nullable=True)
    status = Column(SQLEnum(DecisionStatus), default=DecisionStatus.PROPOSED)
    source_prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=True)
    source_model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=True)
    parameters = Column(JSON, default=dict)  # Decision parameters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    executed_at = Column(DateTime(timezone=True), nullable=True)

    feedbacks = relationship("Feedback", back_populates="decision")


# ─── Feedback Loop ───────────────────────────────────────

class Feedback(Base):
    """Feedback on decisions — did they actually work?"""
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"))
    expected_outcome = Column(Float, nullable=True)
    actual_outcome = Column(Float, nullable=True)
    success = Column(Boolean, nullable=True)
    variance_pct = Column(Float, nullable=True)  # % difference
    notes = Column(Text, nullable=True)
    measured_at = Column(DateTime(timezone=True), server_default=func.now())

    decision = relationship("Decision", back_populates="feedbacks")


# ─── Agentic AI ──────────────────────────────────────────

class AgentRun(Base):
    """Agentic AI pipeline orchestration runs."""
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    trigger = Column(String(100), default="manual")  # manual, scheduled, event
    status = Column(SQLEnum(PipelineStatus), default=PipelineStatus.PENDING)
    steps_completed = Column(JSON, default=list)
    current_step = Column(String(100), nullable=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"), nullable=True)
    log = Column(JSON, default=list)  # Execution log
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
