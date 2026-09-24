"""
Agentic AI Module — Autonomous pipeline orchestration
Coordinates the entire Data-to-Decision pipeline.
"""
import traceback
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import AgentRun, PipelineStatus, Dataset
from app.modules.data_engineering.service import DataEngineeringService
from app.modules.data_quality.service import DataQualityService
from app.modules.analytics.service import AnalyticsService
from app.modules.ml_engineering.service import MLEngineeringService
from app.modules.decision_engine.service import DecisionEngineService
from app.modules.feedback_loop.service import FeedbackLoopService


class AgenticAIService:
    """
    The Agent orchestrates the full pipeline:
    Data → Quality → Analytics → ML → Decision → Feedback
    """

    def __init__(self, db: Session):
        self.db = db
        self.de = DataEngineeringService(db)
        self.dq = DataQualityService(db)
        self.analytics = AnalyticsService(db)
        self.ml = MLEngineeringService(db)
        self.decisions = DecisionEngineService(db)
        self.feedback = FeedbackLoopService(db)

    def run_full_pipeline(
        self,
        dataset_id: int,
        target_column: str,
        algorithm: str = "random_forest_regressor",
        decision_context: str = "default",
    ) -> AgentRun:
        """Run the entire Data-to-Decision pipeline autonomously."""
        agent_run = AgentRun(
            trigger="manual",
            status=PipelineStatus.RUNNING,
            dataset_id=dataset_id,
            started_at=datetime.utcnow(),
            steps_completed=[],
            log=[],
        )
        self.db.add(agent_run)
        self.db.commit()

        steps = []
        log = []

        try:
            # ── Step 1: Data Engineering (ETL) ───────────
            agent_run.current_step = "data_engineering"
            self.db.commit()

            log.append({"step": "data_engineering", "status": "started", "time": datetime.utcnow().isoformat()})
            pipeline = self.de.run_etl(dataset_id)
            steps.append("data_engineering")
            log.append({
                "step": "data_engineering",
                "status": "completed",
                "pipeline_id": pipeline.id,
                "pipeline_status": pipeline.status.value,
            })

            # ── Step 2: Data Quality ─────────────────────
            agent_run.current_step = "data_quality"
            self.db.commit()

            log.append({"step": "data_quality", "status": "started", "time": datetime.utcnow().isoformat()})
            quality_report = self.dq.run_quality_checks(dataset_id)
            steps.append("data_quality")
            log.append({
                "step": "data_quality",
                "status": "completed",
                "score": quality_report.overall_score,
                "level": quality_report.level.value,
            })

            # Check quality gate
            if quality_report.overall_score < 30:
                raise ValueError(
                    f"Data quality too low ({quality_report.overall_score}/100). "
                    "Cannot proceed with analysis."
                )

            # ── Step 3: Analytics ────────────────────────
            agent_run.current_step = "analytics"
            self.db.commit()

            log.append({"step": "analytics", "status": "started", "time": datetime.utcnow().isoformat()})
            analytics_snapshot = self.analytics.run_analysis(dataset_id)
            steps.append("analytics")
            log.append({
                "step": "analytics",
                "status": "completed",
                "snapshot_id": analytics_snapshot.id,
            })

            # ── Step 4: ML Training ──────────────────────
            agent_run.current_step = "ml_training"
            self.db.commit()

            log.append({"step": "ml_training", "status": "started", "time": datetime.utcnow().isoformat()})
            ml_model = self.ml.train_model(
                dataset_id=dataset_id,
                target_column=target_column,
                algorithm=algorithm,
            )
            steps.append("ml_training")
            agent_run.model_id = ml_model.id
            log.append({
                "step": "ml_training",
                "status": "completed",
                "model_id": ml_model.id,
                "metrics": ml_model.metrics,
            })

            # ── Step 5: Generate Prediction (using first row as example) ─
            agent_run.current_step = "prediction"
            self.db.commit()

            dataset = self.de.get_dataset(dataset_id)
            df = self.de.load_dataset_df(dataset)
            sample_input = df.drop(columns=[target_column]).iloc[0].to_dict()
            # Clean NaN values
            sample_input = {k: (v if not isinstance(v, float) or not __import__("math").isnan(v) else 0) for k, v in sample_input.items()}

            prediction = self.ml.predict(ml_model.id, sample_input)
            steps.append("prediction")
            log.append({
                "step": "prediction",
                "status": "completed",
                "prediction_value": prediction.prediction_value,
                "confidence": prediction.confidence,
            })

            # ── Step 6: Decision Engine ──────────────────
            agent_run.current_step = "decision_engine"
            self.db.commit()

            log.append({"step": "decision_engine", "status": "started", "time": datetime.utcnow().isoformat()})
            decision = self.decisions.generate_decision(
                prediction_id=prediction.id,
                context=decision_context,
            )
            steps.append("decision_engine")
            agent_run.decision_id = decision.id
            log.append({
                "step": "decision_engine",
                "status": "completed",
                "decision_id": decision.id,
                "decision_title": decision.title,
                "confidence": decision.confidence,
            })

            # ── Complete ─────────────────────────────────
            agent_run.status = PipelineStatus.COMPLETED
            agent_run.current_step = None

        except Exception as e:
            log.append({
                "step": agent_run.current_step or "unknown",
                "status": "failed",
                "error": str(e),
                "traceback": traceback.format_exc(),
            })
            agent_run.status = PipelineStatus.FAILED

        agent_run.steps_completed = steps
        agent_run.log = log
        agent_run.completed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(agent_run)
        return agent_run

    def get_runs(self) -> list[AgentRun]:
        return self.db.query(AgentRun).order_by(AgentRun.created_at.desc()).all()

    def get_run(self, run_id: int) -> AgentRun | None:
        return self.db.query(AgentRun).filter(AgentRun.id == run_id).first()
