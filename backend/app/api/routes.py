"""
Data-to-Decision OS — API Routes
All REST API endpoints for the platform.
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.modules.data_engineering.service import DataEngineeringService
from app.modules.data_quality.service import DataQualityService
from app.modules.analytics.service import AnalyticsService
from app.modules.ml_engineering.service import MLEngineeringService
from app.modules.decision_engine.service import DecisionEngineService
from app.modules.feedback_loop.service import FeedbackLoopService
from app.modules.agentic_ai.service import AgenticAIService

router = APIRouter()


# ─── Pydantic Schemas ───────────────────────────────────

class TrainModelRequest(BaseModel):
    dataset_id: int
    target_column: str
    feature_columns: Optional[list[str]] = None
    algorithm: str = "random_forest_regressor"
    hyperparameters: Optional[dict] = None
    test_size: float = 0.2


class PredictRequest(BaseModel):
    model_id: int
    input_data: dict


class DecisionRequest(BaseModel):
    prediction_id: int
    context: str = "default"


class FeedbackRequest(BaseModel):
    decision_id: int
    actual_outcome: float
    notes: Optional[str] = None


class RunPipelineRequest(BaseModel):
    dataset_id: int
    target_column: str
    algorithm: str = "random_forest_regressor"
    decision_context: str = "default"


# ─── Health Check ────────────────────────────────────────

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "Data-to-Decision OS"}


# ─── Data Engineering ────────────────────────────────────

@router.post("/data/upload")
async def upload_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a CSV or JSON file for ingestion."""
    service = DataEngineeringService(db)
    content = await file.read()

    if file.filename.endswith(".csv"):
        dataset = await service.ingest_csv(content, file.filename)
    elif file.filename.endswith(".json"):
        dataset = await service.ingest_json(content, file.filename)
    else:
        raise HTTPException(400, "Only CSV and JSON files are supported")

    return {
        "id": dataset.id,
        "name": dataset.name,
        "rows": dataset.row_count,
        "columns": dataset.column_count,
        "size_bytes": dataset.size_bytes,
        "columns_metadata": dataset.columns_metadata,
    }


@router.post("/data/seed-demo")
async def seed_demo_dataset(db: Session = Depends(get_db)):
    """Seed sample sales dataset for instant platform demonstration."""
    import os
    from generate_sample_data import generate_sales_data
    file_path = generate_sales_data(n_rows=1000, output_dir="./uploads")
    service = DataEngineeringService(db)
    with open(file_path, "rb") as f:
        content = f.read()
    dataset = await service.ingest_csv(content, "sales_demo_data.csv")
    return {
        "status": "success",
        "id": dataset.id,
        "name": dataset.name,
        "rows": dataset.row_count,
        "columns": dataset.column_count,
    }


@router.get("/data/datasets")
def list_datasets(db: Session = Depends(get_db)):
    """List all ingested datasets."""
    service = DataEngineeringService(db)
    datasets = service.get_all_datasets()
    return [
        {
            "id": d.id,
            "name": d.name,
            "source_type": d.source_type,
            "row_count": d.row_count,
            "column_count": d.column_count,
            "size_bytes": d.size_bytes,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in datasets
    ]


@router.get("/data/datasets/{dataset_id}")
def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    """Get dataset details."""
    service = DataEngineeringService(db)
    d = service.get_dataset(dataset_id)
    if not d:
        raise HTTPException(404, "Dataset not found")
    return {
        "id": d.id,
        "name": d.name,
        "source_type": d.source_type,
        "row_count": d.row_count,
        "column_count": d.column_count,
        "size_bytes": d.size_bytes,
        "columns_metadata": d.columns_metadata,
        "created_at": d.created_at.isoformat() if d.created_at else None,
    }


@router.get("/data/datasets/{dataset_id}/preview")
def preview_dataset(
    dataset_id: int,
    rows: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
):
    """Preview dataset rows."""
    service = DataEngineeringService(db)
    try:
        return service.preview_dataset(dataset_id, rows)
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.post("/data/datasets/{dataset_id}/etl")
def run_etl(dataset_id: int, db: Session = Depends(get_db)):
    """Run ETL pipeline on a dataset."""
    service = DataEngineeringService(db)
    try:
        pipeline = service.run_etl(dataset_id)
        return {
            "id": pipeline.id,
            "name": pipeline.name,
            "status": pipeline.status.value,
            "steps": pipeline.steps,
        }
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/data/pipelines")
def list_pipelines(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    service = DataEngineeringService(db)
    pipelines = service.get_pipelines(dataset_id)
    return [
        {
            "id": p.id,
            "name": p.name,
            "status": p.status.value,
            "dataset_id": p.dataset_id,
            "steps": p.steps,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in pipelines
    ]


# ─── Data Quality ────────────────────────────────────────

@router.post("/quality/check/{dataset_id}")
def run_quality_check(dataset_id: int, db: Session = Depends(get_db)):
    """Run quality checks on a dataset."""
    service = DataQualityService(db)
    try:
        report = service.run_quality_checks(dataset_id)
        return {
            "id": report.id,
            "dataset_id": report.dataset_id,
            "overall_score": report.overall_score,
            "level": report.level.value,
            "checks": report.checks,
            "duplicate_count": report.duplicate_count,
            "anomaly_count": report.anomaly_count,
            "schema_valid": report.schema_valid,
        }
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/quality/reports")
def list_quality_reports(
    dataset_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    service = DataQualityService(db)
    reports = service.get_reports(dataset_id)
    return [
        {
            "id": r.id,
            "dataset_id": r.dataset_id,
            "overall_score": r.overall_score,
            "level": r.level.value,
            "checks": r.checks,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reports
    ]


# ─── Analytics ───────────────────────────────────────────

@router.post("/analytics/analyze/{dataset_id}")
def run_analysis(dataset_id: int, db: Session = Depends(get_db)):
    """Run statistical analysis on a dataset."""
    service = AnalyticsService(db)
    try:
        snapshot = service.run_analysis(dataset_id)
        return {
            "id": snapshot.id,
            "dataset_id": snapshot.dataset_id,
            "summary_stats": snapshot.summary_stats,
            "correlations": snapshot.correlations,
            "distributions": snapshot.distributions,
            "trends": snapshot.trends,
        }
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/analytics/snapshots/{dataset_id}")
def list_analytics_snapshots(dataset_id: int, db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    snapshots = service.get_snapshots(dataset_id)
    return [
        {
            "id": s.id,
            "summary_stats": s.summary_stats,
            "correlations": s.correlations,
            "distributions": s.distributions,
            "trends": s.trends,
            "created_at": s.created_at.isoformat() if s.created_at else None,
        }
        for s in snapshots
    ]


# ─── ML Engineering ──────────────────────────────────────

@router.post("/ml/train")
def train_model(request: TrainModelRequest, db: Session = Depends(get_db)):
    """Train a ML model."""
    service = MLEngineeringService(db)
    try:
        model = service.train_model(
            dataset_id=request.dataset_id,
            target_column=request.target_column,
            feature_columns=request.feature_columns,
            algorithm=request.algorithm,
            hyperparameters=request.hyperparameters,
            test_size=request.test_size,
        )
        return {
            "id": model.id,
            "name": model.name,
            "version": model.version,
            "algorithm": model.algorithm,
            "metrics": model.metrics,
            "feature_columns": model.feature_columns,
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/ml/predict")
def predict(request: PredictRequest, db: Session = Depends(get_db)):
    """Make a prediction with a trained model."""
    service = MLEngineeringService(db)
    try:
        prediction = service.predict(request.model_id, request.input_data)
        return {
            "id": prediction.id,
            "prediction_value": prediction.prediction_value,
            "prediction_label": prediction.prediction_label,
            "confidence": prediction.confidence,
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("/ml/models")
def list_models(db: Session = Depends(get_db)):
    service = MLEngineeringService(db)
    models = service.get_models()
    return [
        {
            "id": m.id,
            "name": m.name,
            "version": m.version,
            "algorithm": m.algorithm,
            "metrics": m.metrics,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in models
    ]


@router.get("/ml/models/{model_id}")
def get_model(model_id: int, db: Session = Depends(get_db)):
    service = MLEngineeringService(db)
    m = service.get_model(model_id)
    if not m:
        raise HTTPException(404, "Model not found")
    return {
        "id": m.id,
        "name": m.name,
        "version": m.version,
        "algorithm": m.algorithm,
        "metrics": m.metrics,
        "feature_columns": m.feature_columns,
        "target_column": m.target_column,
        "hyperparameters": m.hyperparameters,
        "is_active": m.is_active,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


# ─── Decision Engine ────────────────────────────────────

@router.post("/decisions/generate")
def generate_decision(request: DecisionRequest, db: Session = Depends(get_db)):
    """Generate a decision from a prediction."""
    service = DecisionEngineService(db)
    try:
        decision = service.generate_decision(request.prediction_id, request.context)
        return {
            "id": decision.id,
            "title": decision.title,
            "description": decision.description,
            "category": decision.category,
            "confidence": decision.confidence,
            "impact_estimate": decision.impact_estimate,
            "status": decision.status.value,
        }
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.post("/decisions/{decision_id}/approve")
def approve_decision(decision_id: int, db: Session = Depends(get_db)):
    service = DecisionEngineService(db)
    try:
        decision = service.approve_decision(decision_id)
        return {"id": decision.id, "status": decision.status.value}
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.post("/decisions/{decision_id}/execute")
def execute_decision(decision_id: int, db: Session = Depends(get_db)):
    service = DecisionEngineService(db)
    try:
        decision = service.execute_decision(decision_id)
        return {"id": decision.id, "status": decision.status.value}
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/decisions")
def list_decisions(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    service = DecisionEngineService(db)
    decisions = service.get_decisions(status)
    return [
        {
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "confidence": d.confidence,
            "impact_estimate": d.impact_estimate,
            "status": d.status.value,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in decisions
    ]


# ─── Feedback Loop ───────────────────────────────────────

@router.post("/feedback/record")
def record_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    """Record real-world outcome of a decision."""
    service = FeedbackLoopService(db)
    try:
        feedback = service.record_feedback(
            request.decision_id, request.actual_outcome, request.notes
        )
        return {
            "id": feedback.id,
            "expected_outcome": feedback.expected_outcome,
            "actual_outcome": feedback.actual_outcome,
            "success": feedback.success,
            "variance_pct": feedback.variance_pct,
        }
    except ValueError as e:
        raise HTTPException(404, str(e))


@router.get("/feedback/stats")
def feedback_stats(db: Session = Depends(get_db)):
    service = FeedbackLoopService(db)
    return service.get_success_rate()


@router.get("/feedback")
def list_feedback(db: Session = Depends(get_db)):
    service = FeedbackLoopService(db)
    feedbacks = service.get_all_feedback()
    return [
        {
            "id": f.id,
            "decision_id": f.decision_id,
            "expected_outcome": f.expected_outcome,
            "actual_outcome": f.actual_outcome,
            "success": f.success,
            "variance_pct": f.variance_pct,
            "measured_at": f.measured_at.isoformat() if f.measured_at else None,
        }
        for f in feedbacks
    ]


# ─── Agentic AI (Full Pipeline) ─────────────────────────

@router.post("/agent/run")
def run_agent_pipeline(request: RunPipelineRequest, db: Session = Depends(get_db)):
    """Run the full Data-to-Decision pipeline autonomously."""
    service = AgenticAIService(db)
    run = service.run_full_pipeline(
        dataset_id=request.dataset_id,
        target_column=request.target_column,
        algorithm=request.algorithm,
        decision_context=request.decision_context,
    )
    return {
        "id": run.id,
        "status": run.status.value,
        "steps_completed": run.steps_completed,
        "current_step": run.current_step,
        "log": run.log,
        "model_id": run.model_id,
        "decision_id": run.decision_id,
    }


@router.get("/agent/runs")
def list_agent_runs(db: Session = Depends(get_db)):
    service = AgenticAIService(db)
    runs = service.get_runs()
    return [
        {
            "id": r.id,
            "status": r.status.value,
            "steps_completed": r.steps_completed,
            "trigger": r.trigger,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        }
        for r in runs
    ]


@router.get("/agent/runs/{run_id}")
def get_agent_run(run_id: int, db: Session = Depends(get_db)):
    service = AgenticAIService(db)
    r = service.get_run(run_id)
    if not r:
        raise HTTPException(404, "Agent run not found")
    return {
        "id": r.id,
        "status": r.status.value,
        "steps_completed": r.steps_completed,
        "current_step": r.current_step,
        "log": r.log,
        "model_id": r.model_id,
        "decision_id": r.decision_id,
        "started_at": r.started_at.isoformat() if r.started_at else None,
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
    }


# ─── Dashboard Overview ─────────────────────────────────

@router.get("/dashboard/overview")
def dashboard_overview(db: Session = Depends(get_db)):
    """Get overview stats for the dashboard."""
    from app.models.models import (
        Dataset, Pipeline, QualityReport, MLModel,
        Decision, Feedback, AgentRun
    )

    datasets_count = db.query(Dataset).count()
    pipelines_count = db.query(Pipeline).count()
    quality_reports_count = db.query(QualityReport).count()
    models_count = db.query(MLModel).count()
    decisions_count = db.query(Decision).count()
    feedbacks_count = db.query(Feedback).count()
    agent_runs_count = db.query(AgentRun).count()

    # Latest quality score
    latest_quality = (
        db.query(QualityReport)
        .order_by(QualityReport.created_at.desc())
        .first()
    )

    # Latest model metrics
    latest_model = (
        db.query(MLModel)
        .order_by(MLModel.created_at.desc())
        .first()
    )

    # Feedback stats
    feedback_service = FeedbackLoopService(db)
    feedback_stats = feedback_service.get_success_rate()

    return {
        "datasets": datasets_count,
        "pipelines": pipelines_count,
        "quality_reports": quality_reports_count,
        "models": models_count,
        "decisions": decisions_count,
        "feedbacks": feedbacks_count,
        "agent_runs": agent_runs_count,
        "latest_quality_score": latest_quality.overall_score if latest_quality else None,
        "latest_quality_level": latest_quality.level.value if latest_quality else None,
        "latest_model_metrics": latest_model.metrics if latest_model else None,
        "latest_model_name": latest_model.name if latest_model else None,
        "feedback_stats": feedback_stats,
    }
