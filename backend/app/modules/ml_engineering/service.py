"""
ML Engineering Module — Model Training, Prediction, Serving
"""
import pandas as pd
import numpy as np
import os
import joblib
from datetime import datetime
from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
)
from app.models.models import Dataset, MLModel, Prediction
from app.modules.data_engineering.service import DataEngineeringService
from app.config import get_settings

settings = get_settings()


class MLEngineeringService:
    """Handles model training, evaluation, and predictions."""

    ALGORITHMS = {
        "random_forest_regressor": RandomForestRegressor,
        "random_forest_classifier": RandomForestClassifier,
        "linear_regression": LinearRegression,
        "logistic_regression": LogisticRegression,
    }

    def __init__(self, db: Session):
        self.db = db
        self.de_service = DataEngineeringService(db)

    def train_model(
        self,
        dataset_id: int,
        target_column: str,
        feature_columns: list[str] | None = None,
        algorithm: str = "random_forest_regressor",
        hyperparameters: dict | None = None,
        test_size: float = 0.2,
    ) -> MLModel:
        """Train a ML model on a dataset."""
        dataset = self.de_service.get_dataset(dataset_id)
        if not dataset:
            raise ValueError(f"Dataset {dataset_id} not found")

        df = self.de_service.load_dataset_df(dataset)

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")

        # Auto-select features if not specified
        if not feature_columns:
            feature_columns = [c for c in df.columns if c != target_column]

        # Prepare features
        df_clean = df[feature_columns + [target_column]].dropna()
        label_encoders = {}

        X = df_clean[feature_columns].copy()
        for col in X.select_dtypes(include=["object", "category"]).columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            label_encoders[col] = le

        y = df_clean[target_column]
        is_classification = y.dtype == "object" or y.nunique() < 10

        if is_classification and algorithm in ["random_forest_regressor", "linear_regression"]:
            algorithm = "random_forest_classifier"

        if is_classification and y.dtype == "object":
            le = LabelEncoder()
            y = le.fit_transform(y)
            label_encoders[target_column] = le

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=test_size, random_state=42
        )

        # Train
        AlgorithmClass = self.ALGORITHMS.get(algorithm)
        if not AlgorithmClass:
            raise ValueError(f"Unknown algorithm: {algorithm}")

        params = hyperparameters or {}
        if algorithm.startswith("random_forest"):
            params.setdefault("n_estimators", 100)
            params.setdefault("random_state", 42)
        elif algorithm == "linear_regression":
            params = {}
        elif algorithm == "logistic_regression":
            params.setdefault("random_state", 42)
            params.setdefault("max_iter", 1000)

        model = AlgorithmClass(**params)
        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        metrics = {}

        if is_classification:
            metrics = {
                "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
                "precision": round(float(precision_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
                "recall": round(float(recall_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
                "f1_score": round(float(f1_score(y_test, y_pred, average="weighted", zero_division=0)), 4),
                "task": "classification",
            }
        else:
            metrics = {
                "rmse": round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 4),
                "mae": round(float(mean_absolute_error(y_test, y_pred)), 4),
                "r2": round(float(r2_score(y_test, y_pred)), 4),
                "task": "regression",
            }

        # Feature importance
        if hasattr(model, "feature_importances_"):
            importance = dict(zip(
                feature_columns,
                [round(float(v), 4) for v in model.feature_importances_]
            ))
            metrics["feature_importance"] = importance

        # Save model
        os.makedirs(settings.MODEL_DIR, exist_ok=True)
        version = self._next_version(dataset.name, algorithm)
        model_filename = f"{algorithm}_{dataset_id}_v{version}.joblib"
        model_path = os.path.join(settings.MODEL_DIR, model_filename)

        joblib.dump({
            "model": model,
            "scaler": scaler,
            "label_encoders": label_encoders,
            "feature_columns": feature_columns,
            "target_column": target_column,
        }, model_path)

        # Save to DB
        ml_model = MLModel(
            name=f"{algorithm.replace('_', ' ').title()} — {dataset.name}",
            version=version,
            algorithm=algorithm,
            dataset_id=dataset_id,
            target_column=target_column,
            feature_columns=feature_columns,
            hyperparameters=params,
            metrics=metrics,
            model_path=model_path,
            is_active=True,
        )
        self.db.add(ml_model)
        self.db.commit()
        self.db.refresh(ml_model)
        return ml_model

    def predict(self, model_id: int, input_data: dict) -> Prediction:
        """Make a prediction using a trained model."""
        ml_model = self.db.query(MLModel).filter(MLModel.id == model_id).first()
        if not ml_model:
            raise ValueError(f"Model {model_id} not found")

        artifacts = joblib.load(ml_model.model_path)
        model = artifacts["model"]
        scaler = artifacts["scaler"]
        label_encoders = artifacts["label_encoders"]
        feature_columns = artifacts["feature_columns"]

        # Prepare input
        input_df = pd.DataFrame([input_data])
        for col in input_df.select_dtypes(include=["object", "category"]).columns:
            if col in label_encoders:
                input_df[col] = label_encoders[col].transform(input_df[col].astype(str))

        # Ensure correct column order
        X = input_df[feature_columns]
        X_scaled = scaler.transform(X)

        # Predict
        pred_value = model.predict(X_scaled)[0]
        confidence = None

        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X_scaled)[0]
            confidence = round(float(max(proba)), 4)

        # Decode prediction if classification
        target_col = ml_model.target_column
        pred_label = None
        if target_col in label_encoders:
            pred_label = str(label_encoders[target_col].inverse_transform([int(pred_value)])[0])
            pred_value = float(pred_value)
        else:
            pred_value = round(float(pred_value), 4)

        prediction = Prediction(
            model_id=model_id,
            input_data=input_data,
            prediction_value=pred_value,
            prediction_label=pred_label,
            confidence=confidence,
        )
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        return prediction

    def get_models(self) -> list[MLModel]:
        return self.db.query(MLModel).order_by(MLModel.created_at.desc()).all()

    def get_model(self, model_id: int) -> MLModel | None:
        return self.db.query(MLModel).filter(MLModel.id == model_id).first()

    def _next_version(self, dataset_name: str, algorithm: str) -> str:
        count = (
            self.db.query(MLModel)
            .filter(MLModel.algorithm == algorithm)
            .count()
        )
        return f"1.{count}.0"
