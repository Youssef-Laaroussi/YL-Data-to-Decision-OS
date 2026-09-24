# Architecture Guide

This document describes the high-level architecture of **Data-to-Decision OS**.

---

## 1. Vision & Core Philosophy

Most data stacks stop at dashboards and business intelligence:
`Raw Data -> Ingestion -> Warehouse -> Dashboard`

While dashboards provide visibility, human operators are still left to interpret ambiguous charts, manually determine actions, and rarely track if the action yielded the intended business outcome.

**Data-to-Decision OS** closes this gap with an autonomous closed-loop system:

```
[Raw Data] ──> [Data Engineering] ──> [Data Quality] ──> [Analytics & BI]
                                                               │
                                                               ▼
[Feedback Loop] <── [Decision Engine] <── [MLOps] <── [ML Engineering]
      │
      └───────── (Continuous Re-evaluation & Retraining) ─────────┘
```

---

## 2. System Layers

### 2.1 Storage & Lakehouse
- **PostgreSQL / SQLite**: Metadata persistence, transactional event tracking, pipeline run status, quality scores, and decision catalogs.
- **Artifact Store**: File uploads (`./uploads`) and serialized ML models (`./ml_models`).

### 2.2 Core Modules

1. **Data Engineering Service (`app.modules.data_engineering`)**
   - Supports CSV, JSON, and stream ingest.
   - Extracts column-level profiling (data types, missing rates, cardinality).
   - Manages ETL/ELT transformations and runs.

2. **Data Quality Service (`app.modules.data_quality`)**
   - Enforces data contracts and schema integrity.
   - Audits completeness, uniqueness, and type consistency.
   - Detects statistical outliers using Interquartile Range (IQR).
   - Computes an aggregate Quality Score (0-100) with gating rules.

3. **Analytics Service (`app.modules.analytics`)**
   - Descriptive statistics (mean, std, quantiles).
   - Pearson correlation matrices.
   - Distribution binning and category breakdowns.

4. **ML Engineering Service (`app.modules.ml_engineering`)**
   - Automated train/test partitioning.
   - Supported algorithms: Random Forest, Gradient Boosting, Linear Regression.
   - Model evaluation ($R^2$, RMSE, MAE).
   - Feature importance extraction.
   - Model artifact persistence (`joblib`).

5. **Decision Engine Service (`app.modules.decision_engine`)**
   - Prescriptive rule engine translating ML inferences into actions.
   - Estimates financial impact (ROI, revenue delta).
   - Computes confidence scores.
   - Tracks decision states: `proposed`, `approved`, `executed`, `evaluated`.

6. **Feedback Loop Service (`app.modules.feedback_loop`)**
   - Measures actual real-world outcomes post-execution.
   - Calculates outcome variance and success rates.
   - Provides retraining signals for model drift prevention.

7. **Agentic AI Orchestrator (`app.modules.agentic_ai`)**
   - Autonomous multi-agent coordination.
   - Sequentially triggers and monitors pipeline stages.
   - Handles quality gates and conditional fallbacks.
   - Maintains full execution audit logs (`agent_runs`).

---

## 3. Technology Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pandas, Scikit-Learn, Uvicorn.
- **Frontend**: React 18, Vite, React Router v6, Recharts, Lucide React, Vanilla CSS.
- **Database**: PostgreSQL 15+ (Production) / SQLite (Zero-friction local dev).
- **Deployment**: Docker, Docker Compose, GitHub Actions CI.
