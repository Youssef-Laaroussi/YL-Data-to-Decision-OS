"""
Decision Engine Module — Transform predictions into actionable recommendations
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    Decision, DecisionStatus, MLModel, Prediction, Feedback
)


class DecisionEngineService:
    """Generates actionable decisions from ML predictions."""

    # Rule-based decision templates
    DECISION_RULES = {
        "sales_forecast": {
            "high_demand": {
                "threshold": 0.8,  # percentile
                "action": "Increase stock by {pct}%",
                "category": "inventory",
            },
            "low_demand": {
                "threshold": 0.2,
                "action": "Reduce stock by {pct}% and offer {pct}% discount",
                "category": "pricing",
            },
            "stable": {
                "action": "Maintain current inventory levels",
                "category": "inventory",
            },
        },
        "churn_prediction": {
            "high_risk": {
                "threshold": 0.7,
                "action": "Send retention offer: {pct}% discount for loyal customers",
                "category": "retention",
            },
            "medium_risk": {
                "threshold": 0.4,
                "action": "Schedule follow-up communication",
                "category": "engagement",
            },
            "low_risk": {
                "action": "Continue standard service",
                "category": "maintenance",
            },
        },
        "default": {
            "high": {
                "threshold": 0.75,
                "action": "Take proactive action — value is significantly above average",
                "category": "proactive",
            },
            "low": {
                "threshold": 0.25,
                "action": "Investigate — value is significantly below average",
                "category": "investigation",
            },
            "normal": {
                "action": "No action required — within expected range",
                "category": "monitoring",
            },
        },
    }

    def __init__(self, db: Session):
        self.db = db

    def generate_decision(
        self,
        prediction_id: int,
        context: str = "default",
    ) -> Decision:
        """Generate a decision from a prediction."""
        prediction = self.db.query(Prediction).filter(Prediction.id == prediction_id).first()
        if not prediction:
            raise ValueError(f"Prediction {prediction_id} not found")

        model = self.db.query(MLModel).filter(MLModel.id == prediction.model_id).first()
        rules = self.DECISION_RULES.get(context, self.DECISION_RULES["default"])

        pred_val = prediction.prediction_value
        confidence = prediction.confidence or 0.5

        # Determine which rule applies
        if pred_val is not None:
            if "high_demand" in rules and pred_val > rules.get("high_demand", {}).get("threshold", 0.8):
                rule_key = "high_demand"
            elif "high_risk" in rules and pred_val > rules.get("high_risk", {}).get("threshold", 0.7):
                rule_key = "high_risk"
            elif "high" in rules and pred_val > rules.get("high", {}).get("threshold", 0.75):
                rule_key = "high"
            elif "low_demand" in rules and pred_val < rules.get("low_demand", {}).get("threshold", 0.2):
                rule_key = "low_demand"
            elif "low_risk" in rules and pred_val < rules.get("low_risk", {}).get("threshold", 0.4):
                rule_key = "low_risk"
            elif "low" in rules and pred_val < rules.get("low", {}).get("threshold", 0.25):
                rule_key = "low"
            else:
                rule_key = "stable" if "stable" in rules else ("medium_risk" if "medium_risk" in rules else "normal")
        else:
            rule_key = list(rules.keys())[-1]

        rule = rules[rule_key]
        pct = int(abs(pred_val or 0) * 15 + 5)  # Dynamic percentage

        action = rule["action"].format(pct=pct)
        impact = round(abs(pred_val or 0) * 100, 1)

        decision = Decision(
            title=action,
            description=f"Based on model '{model.name}' prediction (value={pred_val}, confidence={confidence}). "
                        f"Context: {context}, Rule: {rule_key}.",
            category=rule.get("category", "general"),
            confidence=confidence,
            impact_estimate=impact,
            status=DecisionStatus.PROPOSED,
            source_prediction_id=prediction.id,
            source_model_id=model.id if model else None,
            parameters={
                "prediction_value": pred_val,
                "rule_applied": rule_key,
                "context": context,
                "dynamic_pct": pct,
            },
        )
        self.db.add(decision)
        self.db.commit()
        self.db.refresh(decision)
        return decision

    def approve_decision(self, decision_id: int) -> Decision:
        """Approve a proposed decision."""
        decision = self.db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision {decision_id} not found")
        decision.status = DecisionStatus.APPROVED
        self.db.commit()
        self.db.refresh(decision)
        return decision

    def execute_decision(self, decision_id: int) -> Decision:
        """Mark a decision as executed."""
        decision = self.db.query(Decision).filter(Decision.id == decision_id).first()
        if not decision:
            raise ValueError(f"Decision {decision_id} not found")
        decision.status = DecisionStatus.EXECUTED
        decision.executed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(decision)
        return decision

    def get_decisions(self, status: str = None) -> list[Decision]:
        query = self.db.query(Decision)
        if status:
            query = query.filter(Decision.status == status)
        return query.order_by(Decision.created_at.desc()).all()

    def get_decision(self, decision_id: int) -> Decision | None:
        return self.db.query(Decision).filter(Decision.id == decision_id).first()
