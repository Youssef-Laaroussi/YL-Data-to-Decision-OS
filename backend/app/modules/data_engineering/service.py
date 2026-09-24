"""
Data Engineering Module — Ingestion, ETL, Pipeline Management
"""
import pandas as pd
import json
import os
from datetime import datetime
from io import StringIO, BytesIO
from sqlalchemy.orm import Session
from app.models.models import Dataset, Pipeline, PipelineStatus
from app.config import get_settings

settings = get_settings()


class DataEngineeringService:
    """Handles data ingestion, ETL transformations, and pipeline management."""

    def __init__(self, db: Session):
        self.db = db

    # ─── Ingestion ───────────────────────────────────────

    async def ingest_csv(self, file_content: bytes, filename: str) -> Dataset:
        """Ingest a CSV file into the platform."""
        df = pd.read_csv(BytesIO(file_content))

        # Save file
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(file_content)

        # Extract metadata
        columns_metadata = {}
        for col in df.columns:
            columns_metadata[col] = {
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
                "sample_values": df[col].dropna().head(3).tolist(),
            }

        dataset = Dataset(
            name=filename.replace(".csv", "").replace("_", " ").title(),
            source_type="csv",
            file_path=file_path,
            row_count=len(df),
            column_count=len(df.columns),
            columns_metadata=columns_metadata,
            size_bytes=len(file_content),
        )
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    async def ingest_json(self, file_content: bytes, filename: str) -> Dataset:
        """Ingest a JSON file into the platform."""
        data = json.loads(file_content)
        df = pd.DataFrame(data) if isinstance(data, list) else pd.json_normalize(data)

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(file_content)

        columns_metadata = {}
        for col in df.columns:
            columns_metadata[col] = {
                "dtype": str(df[col].dtype),
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
            }

        dataset = Dataset(
            name=filename.replace(".json", "").replace("_", " ").title(),
            source_type="json",
            file_path=file_path,
            row_count=len(df),
            column_count=len(df.columns),
            columns_metadata=columns_metadata,
            size_bytes=len(file_content),
        )
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    # ─── ETL ─────────────────────────────────────────────

    def load_dataset_df(self, dataset: Dataset) -> pd.DataFrame:
        """Load a dataset as a pandas DataFrame."""
        if dataset.source_type == "csv":
            return pd.read_csv(dataset.file_path)
        elif dataset.source_type == "json":
            return pd.read_json(dataset.file_path)
        raise ValueError(f"Unsupported source type: {dataset.source_type}")

    def run_etl(self, dataset_id: int) -> Pipeline:
        """Run a basic ETL pipeline: clean → transform → enrich."""
        dataset = self.db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")

        pipeline = Pipeline(
            name=f"ETL — {dataset.name}",
            dataset_id=dataset.id,
            status=PipelineStatus.RUNNING,
            started_at=datetime.utcnow(),
            steps=[],
        )
        self.db.add(pipeline)
        self.db.commit()

        try:
            df = self.load_dataset_df(dataset)
            steps = []

            # Step 1: Clean — remove duplicates
            initial_rows = len(df)
            df = df.drop_duplicates()
            steps.append({
                "step": "remove_duplicates",
                "status": "completed",
                "rows_removed": initial_rows - len(df),
            })

            # Step 2: Clean — handle nulls (fill numeric with median, categorical with mode)
            null_fills = {}
            for col in df.columns:
                null_count = int(df[col].isnull().sum())
                if null_count > 0:
                    if df[col].dtype in ["float64", "int64"]:
                        fill_val = df[col].median()
                        df[col].fillna(fill_val, inplace=True)
                        null_fills[col] = {"filled_with": "median", "value": float(fill_val), "count": null_count}
                    else:
                        fill_val = df[col].mode().iloc[0] if not df[col].mode().empty else "unknown"
                        df[col].fillna(fill_val, inplace=True)
                        null_fills[col] = {"filled_with": "mode", "value": str(fill_val), "count": null_count}

            steps.append({
                "step": "handle_nulls",
                "status": "completed",
                "fills": null_fills,
            })

            # Step 3: Type optimization
            for col in df.select_dtypes(include=["object"]).columns:
                if df[col].nunique() / len(df) < 0.5:
                    df[col] = df[col].astype("category")

            steps.append({
                "step": "type_optimization",
                "status": "completed",
            })

            # Save cleaned data
            clean_path = dataset.file_path.replace(".", "_clean.")
            if dataset.source_type == "csv":
                df.to_csv(clean_path, index=False)
            else:
                df.to_json(clean_path, orient="records")

            steps.append({
                "step": "save_clean_data",
                "status": "completed",
                "path": clean_path,
                "final_rows": len(df),
                "final_cols": len(df.columns),
            })

            pipeline.steps = steps
            pipeline.status = PipelineStatus.COMPLETED
            pipeline.completed_at = datetime.utcnow()

        except Exception as e:
            pipeline.status = PipelineStatus.FAILED
            pipeline.error_message = str(e)
            pipeline.completed_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(pipeline)
        return pipeline

    # ─── Data Preview ────────────────────────────────────

    def preview_dataset(self, dataset_id: int, rows: int = 20) -> dict:
        """Get a preview of the dataset."""
        dataset = self.db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")

        df = self.load_dataset_df(dataset)
        return {
            "columns": list(df.columns),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "data": df.head(rows).to_dict(orient="records"),
            "shape": {"rows": len(df), "columns": len(df.columns)},
        }

    def get_all_datasets(self) -> list[Dataset]:
        return self.db.query(Dataset).order_by(Dataset.created_at.desc()).all()

    def get_dataset(self, dataset_id: int) -> Dataset:
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def get_pipelines(self, dataset_id: int = None) -> list[Pipeline]:
        query = self.db.query(Pipeline)
        if dataset_id:
            query = query.filter(Pipeline.dataset_id == dataset_id)
        return query.order_by(Pipeline.created_at.desc()).all()
