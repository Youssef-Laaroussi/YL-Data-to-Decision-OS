"""
Feedback Loop Module — Measure decision impact and re-evaluate
"""
from sqlalchemy.orm import Session
from app.models.models import Decision, DecisionStatus, Feedback


class FeedbackLoopService:
    """Tracks decision outcomes and measures real-world impact."""

    def __init__(self, db: Session):
        self.db = db

    def record_feedback(
        self,
        decision_id: int,
        actual_outcome: float,
        notes: str = None,
    ) -> Feedback:
        """Record real-world outcome of a decision."""
        decision = self.db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision {decision_id} not found")

        expected = decision.impact_estimate or 0
        variance_pct = 0.0
        if expected != 0:
            variance_pct = round(((actual_outcome - expected) / abs(expected)) * 100, 2)

        success = actual_outcome >= expected * 0.8  # Within 80% of expected

        feedback = Feedback(
            decision_id=decision_id,
            expected_outcome=expected,
            actual_outcome=actual_outcome,
            success=success,
            variance_pct=variance_pct,
            notes=notes,
        )

        # Update decision status
        decision.status = DecisionStatus.EVALUATED

        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        return feedback

    def get_feedback_for_decision(self, decision_id: int) -> list[Feedback]:
        return (
            self.db.query(Feedback)
            .filter(Feedback.decision_id == decision_id)
            .order_by(Feedback.measured_at.desc())
            .all()
        )

    def get_all_feedback(self) -> list[Feedback]:
        return self.db.query(Feedback).order_by(Feedback.measured_at.desc()).all()

    def get_success_rate(self) -> dict:
        """Calculate overall decision success rate."""
        all_feedback = self.get_all_feedback()
        if not all_feedback:
            return {"total": 0, "successful": 0, "failed": 0, "success_rate": 0}

        successful = sum(1 for f in all_feedback if f.success)
        total = len(all_feedback)

        return {
            "total": total,
            "successful": successful,
            "failed": total - successful,
            "success_rate": round(successful / total * 100, 1) if total > 0 else 0,
            "avg_variance_pct": round(
                sum(f.variance_pct or 0 for f in all_feedback) / total, 2
            ),
        }
