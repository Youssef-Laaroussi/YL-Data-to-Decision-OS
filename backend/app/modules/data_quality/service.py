"""
Data Quality Module — Validation, Anomaly Detection, Data Contracts
"""
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.models import Dataset, QualityReport, DataQualityLevel
from app.modules.data_engineering.service import DataEngineeringService


class DataQualityService:
    """Validates data quality with comprehensive checks."""

    def __init__(self, db: Session):
        self.db = db
        self.de_service = DataEngineeringService(db)

    def run_quality_checks(self, dataset_id: int) -> QualityReport:
        """Run all quality checks on a dataset and produce a report."""
        dataset = self.de_service.get_dataset(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")

        df = self.de_service.load_dataset_df(dataset)
        checks = []
        total_score = 0
        max_score = 0

        # ── Check 1: Completeness (null values) ─────────
        null_summary = {}
        completeness_score = 100
        for col in df.columns:
            null_count = int(df[col].isnull().sum())
            null_pct = round(null_count / len(df) * 100, 2) if len(df) > 0 else 0
            null_summary[col] = {
                "null_count": null_count,
                "null_pct": null_pct,
                "status": "pass" if null_pct < 5 else ("warning" if null_pct < 20 else "fail"),
            }
            if null_pct > 0:
                completeness_score -= null_pct / len(df.columns)

        checks.append({
            "name": "Completeness",
            "description": "Check for null/missing values",
            "score": round(max(completeness_score, 0), 1),
            "status": "pass" if completeness_score > 90 else ("warning" if completeness_score > 70 else "fail"),
            "details": null_summary,
        })
        total_score += completeness_score
        max_score += 100

        # ── Check 2: Uniqueness (duplicates) ────────────
        duplicate_count = int(df.duplicated().sum())
        dup_pct = round(duplicate_count / len(df) * 100, 2) if len(df) > 0 else 0
        uniqueness_score = max(100 - dup_pct * 5, 0)

        checks.append({
            "name": "Uniqueness",
            "description": "Check for duplicate rows",
            "score": round(uniqueness_score, 1),
            "status": "pass" if dup_pct < 1 else ("warning" if dup_pct < 5 else "fail"),
            "details": {"duplicate_rows": duplicate_count, "duplicate_pct": dup_pct},
        })
        total_score += uniqueness_score
        max_score += 100

        # ── Check 3: Consistency (type consistency) ─────
        consistency_issues = []
        consistency_score = 100
        for col in df.select_dtypes(include=["object"]).columns:
            # Check if a string column has mixed types
            try:
                numeric_count = pd.to_numeric(df[col], errors="coerce").notna().sum()
                if 0 < numeric_count < len(df[col].dropna()):
                    consistency_issues.append({
                        "column": col,
                        "issue": "mixed_types",
                        "numeric_values": int(numeric_count),
                        "total_values": int(len(df[col].dropna())),
                    })
                    consistency_score -= 10
            except Exception:
                pass

        checks.append({
            "name": "Consistency",
            "description": "Check for type consistency within columns",
            "score": round(max(consistency_score, 0), 1),
            "status": "pass" if consistency_score > 90 else ("warning" if consistency_score > 70 else "fail"),
            "details": {"issues": consistency_issues},
        })
        total_score += consistency_score
        max_score += 100

        # ── Check 4: Outlier / Anomaly Detection ────────
        anomaly_count = 0
        anomaly_details = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            outliers = df[(df[col] < lower) | (df[col] > upper)]
            outlier_count = len(outliers)
            anomaly_count += outlier_count
            if outlier_count > 0:
                anomaly_details[col] = {
                    "outlier_count": outlier_count,
                    "lower_bound": round(float(lower), 2),
                    "upper_bound": round(float(upper), 2),
                    "min": round(float(df[col].min()), 2),
                    "max": round(float(df[col].max()), 2),
                }

        anomaly_pct = round(anomaly_count / (len(df) * len(df.select_dtypes(include=[np.number]).columns)) * 100, 2) if len(df) > 0 else 0
        anomaly_score = max(100 - anomaly_pct * 2, 0)

        checks.append({
            "name": "Anomaly Detection",
            "description": "IQR-based outlier detection on numeric columns",
            "score": round(anomaly_score, 1),
            "status": "pass" if anomaly_pct < 2 else ("warning" if anomaly_pct < 10 else "fail"),
            "details": anomaly_details,
        })
        total_score += anomaly_score
        max_score += 100

        # ── Check 5: Schema Validation ──────────────────
        schema_valid = True
        schema_issues = []
        for col in df.columns:
            if " " in col or any(c in col for c in ["#", "@", "!", "$"]):
                schema_issues.append({"column": col, "issue": "invalid_column_name"})
                schema_valid = False

        schema_score = 100 if schema_valid else max(100 - len(schema_issues) * 20, 0)
        checks.append({
            "name": "Schema Validation",
            "description": "Validate column names and structure",
            "score": round(schema_score, 1),
            "status": "pass" if schema_valid else "warning",
            "details": {"issues": schema_issues},
        })
        total_score += schema_score
        max_score += 100

        # ── Overall Score ────────────────────────────────
        overall = round(total_score / max_score * 100, 1) if max_score > 0 else 0

        if overall >= 90:
            level = DataQualityLevel.EXCELLENT
        elif overall >= 70:
            level = DataQualityLevel.GOOD
        elif overall >= 50:
            level = DataQualityLevel.WARNING
        else:
            level = DataQualityLevel.CRITICAL

        report = QualityReport(
            dataset_id=dataset_id,
            overall_score=overall,
            level=level,
            checks=checks,
            null_summary=null_summary,
            duplicate_count=duplicate_count,
            anomaly_count=anomaly_count,
            schema_valid=schema_valid,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_reports(self, dataset_id: int = None) -> list[QualityReport]:
        query = self.db.query(QualityReport)
        if dataset_id:
            query = query.filter(QualityReport.dataset_id == dataset_id)
        return query.order_by(QualityReport.created_at.desc()).all()

    def get_latest_report(self, dataset_id: int) -> QualityReport | None:
        return (
            self.db.query(QualityReport)
            .filter(QualityReport.dataset_id == dataset_id)
            .order_by(QualityReport.created_at.desc())
            .first()
        )
