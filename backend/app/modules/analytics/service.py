"""
Analytics Module — Statistical Analysis, Distributions, Correlations
"""
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.models.models import Dataset, AnalyticsSnapshot
from app.modules.data_engineering.service import DataEngineeringService


class AnalyticsService:
    """Performs statistical analysis and exploration on datasets."""

    def __init__(self, db: Session):
        self.db = db
        self.de_service = DataEngineeringService(db)

    def run_analysis(self, dataset_id: int) -> AnalyticsSnapshot:
        """Run comprehensive statistical analysis on a dataset."""
        dataset = self.de_service.get_dataset(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")

        df = self.de_service.load_dataset_df(dataset)

        # ── Summary Statistics ───────────────────────────
        summary_stats = {}
        for col in df.columns:
            stats = {"dtype": str(df[col].dtype), "count": int(df[col].count())}
            if df[col].dtype in ["int64", "float64"]:
                stats.update({
                    "mean": round(float(df[col].mean()), 2),
                    "median": round(float(df[col].median()), 2),
                    "std": round(float(df[col].std()), 2),
                    "min": round(float(df[col].min()), 2),
                    "max": round(float(df[col].max()), 2),
                    "q25": round(float(df[col].quantile(0.25)), 2),
                    "q75": round(float(df[col].quantile(0.75)), 2),
                    "skewness": round(float(df[col].skew()), 3),
                    "kurtosis": round(float(df[col].kurtosis()), 3),
                })
            else:
                stats.update({
                    "unique": int(df[col].nunique()),
                    "top": str(df[col].mode().iloc[0]) if not df[col].mode().empty else None,
                    "top_freq": int(df[col].value_counts().iloc[0]) if len(df[col].value_counts()) > 0 else 0,
                })
            summary_stats[col] = stats

        # ── Correlations ─────────────────────────────────
        numeric_df = df.select_dtypes(include=[np.number])
        correlations = {}
        if len(numeric_df.columns) > 1:
            corr_matrix = numeric_df.corr()
            for col in corr_matrix.columns:
                correlations[col] = {
                    c: round(float(v), 3)
                    for c, v in corr_matrix[col].items()
                    if c != col and not np.isnan(v)
                }

        # ── Distributions ────────────────────────────────
        distributions = {}
        for col in numeric_df.columns:
            hist, bin_edges = np.histogram(df[col].dropna(), bins=20)
            distributions[col] = {
                "histogram": {
                    "counts": hist.tolist(),
                    "bin_edges": [round(float(b), 2) for b in bin_edges],
                },
            }

        # Top categorical distributions
        for col in df.select_dtypes(include=["object", "category"]).columns:
            value_counts = df[col].value_counts().head(10)
            distributions[col] = {
                "value_counts": {str(k): int(v) for k, v in value_counts.items()},
            }

        # ── Trends (if date column exists) ───────────────
        trends = {}
        date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
        # Try to detect date-like string columns
        for col in df.select_dtypes(include=["object"]).columns:
            try:
                pd.to_datetime(df[col].head(5))
                date_cols.append(col)
            except (ValueError, TypeError):
                pass

        if date_cols and len(numeric_df.columns) > 0:
            date_col = date_cols[0]
            df_sorted = df.copy()
            df_sorted[date_col] = pd.to_datetime(df_sorted[date_col], errors="coerce")
            df_sorted = df_sorted.dropna(subset=[date_col]).sort_values(date_col)

            for num_col in numeric_df.columns[:3]:  # Top 3 numeric columns
                daily = df_sorted.groupby(df_sorted[date_col].dt.to_period("D"))[num_col].mean()
                trends[num_col] = {
                    "dates": [str(d) for d in daily.index],
                    "values": [round(float(v), 2) for v in daily.values],
                }

        snapshot = AnalyticsSnapshot(
            dataset_id=dataset_id,
            summary_stats=summary_stats,
            correlations=correlations,
            distributions=distributions,
            trends=trends,
        )
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def get_snapshots(self, dataset_id: int) -> list[AnalyticsSnapshot]:
        return (
            self.db.query(AnalyticsSnapshot)
            .filter(AnalyticsSnapshot.dataset_id == dataset_id)
            .order_by(AnalyticsSnapshot.created_at.desc())
            .all()
        )

    def get_latest_snapshot(self, dataset_id: int) -> AnalyticsSnapshot | None:
        return (
            self.db.query(AnalyticsSnapshot)
            .filter(AnalyticsSnapshot.dataset_id == dataset_id)
            .order_by(AnalyticsSnapshot.created_at.desc())
            .first()
        )
