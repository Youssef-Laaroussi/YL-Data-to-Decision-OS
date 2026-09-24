import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database, ShieldCheck, BarChart3, Brain, Target, RotateCcw, Bot,
  ArrowRight, CheckCircle2, Sparkles, Github, Layers, Zap, Activity,
  Play, Award, ArrowUpRight, ChevronRight, Lock
} from 'lucide-react';

const PIPELINE_HIGHLIGHTS = [
  {
    step: '01',
    id: 'data',
    title: 'Data Engineering',
    desc: 'Ingest CSV, JSON & streaming events with automatic profiling, schema validation, and ETL pipelines.',
    icon: Database,
    color: 'blue',
    stat: '100% automated profiling',
    details: ['Schema inference', 'ETL/ELT transformation', 'Column cardinality & null analysis']
  },
  {
    step: '02',
    id: 'quality',
    title: 'Data Quality & Contracts',
    desc: 'Enforce data contracts with composite scoring (completeness, uniqueness, IQR outliers) and automated quality gates.',
    icon: ShieldCheck,
    color: 'emerald',
    stat: 'Quality Gates (<30 halts pipeline)',
    details: ['Completeness & uniqueness', 'IQR outlier detection', 'Data contract enforcement']
  },
  {
    step: '03',
    id: 'analytics',
    title: 'Analytics & BI',
    desc: 'Deep exploratory analysis, statistical distributions, correlation matrices, and real-time business KPIs.',
    icon: BarChart3,
    color: 'indigo',
    stat: 'Interactive distributions & trends',
    details: ['Pearson correlation matrix', 'Quantile profiling', 'KPI tracking with trends']
  },
  {
    step: '04',
    id: 'ml',
    title: 'ML Engineering & MLOps',
    desc: 'Train predictive models (Random Forest, Gradient Boosting), evaluate R² & RMSE, track feature importance and drift.',
    icon: Brain,
    color: 'purple',
    stat: 'Real scikit-learn models & registry',
    details: ['Train/Test split evaluation', 'Feature importances', 'Artifact persistence (.joblib)']
  },
  {
    step: '05',
    id: 'decisions',
    title: 'Decision Intelligence',
    desc: 'Translate raw predictions into actionable business operations (stock, pricing, retention) with estimated ROI and confidence.',
    icon: Target,
    color: 'amber',
    stat: 'Actionable ROI estimation',
    details: ['Prescriptive business rules', 'Financial impact modeling', 'Lifecycle: proposed → executed']
  },
  {
    step: '06',
    id: 'feedback',
    title: 'Feedback Loop & Drift',
    desc: 'Close the loop by recording real-world outcomes, measuring actual vs expected ROI, and calculating variance.',
    icon: RotateCcw,
    color: 'cyan',
    stat: 'Continuous learning & validation',
    details: ['Expected vs actual outcome', 'Variance percentage tracking', 'Model retraining triggers']
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="landing-page">
      {/* ─── Top Navigation Bar ────────────────────────────── */}
      <header className="landing-nav">
        <div className="landing-nav__container">
          <Link to="/" className="landing-nav__logo">
            <div className="landing-nav__logo-badge">
              <Bot size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <span className="landing-nav__logo-title">Data-to-Decision OS</span>
              <span className="landing-nav__logo-tag">Open Source</span>
            </div>
          </Link>

          <nav className="landing-nav__links">
            <a href="#pipeline" className="landing-nav__link">Pipeline</a>
            <a href="#features" className="landing-nav__link">Modules</a>
            <a href="#architecture" className="landing-nav__link">Architecture</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="landing-nav__link landing-nav__link--github"
            >
              <Github size={16} />
              <span>GitHub</span>
            </a>
          </nav>

          <div className="landing-nav__actions">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn--primary btn--landing"
            >
              <span>Launch Platform</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero__badge">
          <Sparkles size={14} style={{ color: 'var(--accent-indigo)' }} />
          <span>The Open Source Data-to-Decision Operating System</span>
        </div>

        <h1 className="landing-hero__title">
          Transform Raw Data into{' '}
          <span className="gradient-text">Measurable Decisions.</span>
        </h1>

        <p className="landing-hero__subtitle">
          Most data platforms stop at dashboards. <strong>Data-to-Decision OS</strong> closes the loop:
          orchestrating automated ETL, data contracts, predictive ML, prescriptive actions with ROI estimates,
          and real-world feedback tracking.
        </p>

        <div className="landing-hero__ctas">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn--primary btn--lg btn--hero-primary"
          >
            <span>Open Dashboard</span>
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/pipeline')}
            className="btn btn--secondary btn--lg btn--hero-secondary"
          >
            <Play size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Autonomous Pipeline Agent</span>
          </button>
        </div>

        <div className="landing-hero__trust">
          <div className="trust-item">
            <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
            <span>100% Open Source (MIT)</span>
          </div>
          <div className="trust-item">
            <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
            <span>FastAPI + React 18</span>
          </div>
          <div className="trust-item">
            <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
            <span>PostgreSQL & SQLite Ready</span>
          </div>
          <div className="trust-item">
            <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
            <span>Closed-Loop ROI Tracking</span>
          </div>
        </div>
      </section>

      {/* ─── Interactive Pipeline Section ───────────────────── */}
      <section id="pipeline" className="landing-section landing-section--pipeline">
        <div className="landing-section__header">
          <div className="badge badge--info" style={{ marginBottom: '12px' }}>
            Closed-Loop Methodology
          </div>
          <h2 className="landing-section__title">The 6-Stage Autonomous Engine</h2>
          <p className="landing-section__subtitle">
            Every step is integrated and verifiable. Click a stage to explore how the OS transforms raw bytes into verified business impact.
          </p>
        </div>

        {/* Pipeline Navigation Tabs */}
        <div className="pipeline-tabs">
          {PIPELINE_HIGHLIGHTS.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStep(idx)}
                className={`pipeline-tab ${isActive ? 'pipeline-tab--active' : ''}`}
              >
                <div className="pipeline-tab__header">
                  <span className="pipeline-tab__step">{stage.step}</span>
                  <div className={`pipeline-tab__icon pipeline-tab__icon--${stage.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="pipeline-tab__title">{stage.title}</div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Details Card */}
        <div className="stage-detail-card card">
          <div className="stage-detail-card__grid">
            <div>
              <div className="stage-detail-card__badge">
                Stage {PIPELINE_HIGHLIGHTS[activeStep].step} · {PIPELINE_HIGHLIGHTS[activeStep].stat}
              </div>
              <h3 className="stage-detail-card__title">
                {PIPELINE_HIGHLIGHTS[activeStep].title}
              </h3>
              <p className="stage-detail-card__desc">
                {PIPELINE_HIGHLIGHTS[activeStep].desc}
              </p>

              <div className="stage-detail-card__list">
                {PIPELINE_HIGHLIGHTS[activeStep].details.map((item, i) => (
                  <div key={i} className="stage-detail-item">
                    <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => navigate(`/${PIPELINE_HIGHLIGHTS[activeStep].id}`)}
                  className="btn btn--primary btn--sm"
                >
                  <span>Explore {PIPELINE_HIGHLIGHTS[activeStep].title}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="stage-detail-card__preview">
              <div className="mockup-window">
                <div className="mockup-header">
                  <span className="mockup-dot mockup-dot--red"></span>
                  <span className="mockup-dot mockup-dot--yellow"></span>
                  <span className="mockup-dot mockup-dot--green"></span>
                  <span className="mockup-title">
                    d2d-os://modules/{PIPELINE_HIGHLIGHTS[activeStep].id}
                  </span>
                </div>
                <div className="mockup-content">
                  <div className="mockup-stat-row">
                    <span className="mockup-label">Status:</span>
                    <span className="mockup-value mockup-value--success">Operational (Active)</span>
                  </div>
                  <div className="mockup-stat-row">
                    <span className="mockup-label">Service:</span>
                    <span className="mockup-value">app.modules.{PIPELINE_HIGHLIGHTS[activeStep].id}.service</span>
                  </div>
                  <div className="mockup-stat-row">
                    <span className="mockup-label">Audit Log:</span>
                    <span className="mockup-value">Traceable in agent_runs table</span>
                  </div>
                  <div className="mockup-code-block">
                    <code>
                      {`// Autonomous Execution Example
const result = await d2d.${PIPELINE_HIGHLIGHTS[activeStep].id}.execute({
  dataset_id: 1,
  confidence_gate: 0.85,
  telemetry: true
});`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Features Grid ─────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-section__header">
          <div className="badge badge--success" style={{ marginBottom: '12px' }}>
            Enterprise Foundation
          </div>
          <h2 className="landing-section__title">Everything You Need for Decision Intelligence</h2>
          <p className="landing-section__subtitle">
            Built from the ground up to replace fragmented data pipelines with a unified, transparent operating system.
          </p>
        </div>

        <div className="landing-features-grid">
          <div className="feature-card card">
            <div className="feature-card__icon feature-card__icon--blue">
              <Bot size={24} />
            </div>
            <h3 className="feature-card__title">Agentic AI Orchestrator</h3>
            <p className="feature-card__desc">
              Multi-role autonomous agents coordinate ingestion, quality validation, model selection, and decision generation with complete audit trails.
            </p>
            <div className="feature-card__footer">
              <Link to="/pipeline" className="feature-card__link">
                <span>View Agent Runner</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="feature-card card">
            <div className="feature-card__icon feature-card__icon--green">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-card__title">Automated Quality Gates</h3>
            <p className="feature-card__desc">
              Data contracts are verified before any model is trained. Statistical outliers and missing values are flagged to prevent garbage-in, garbage-out.
            </p>
            <div className="feature-card__footer">
              <Link to="/quality" className="feature-card__link">
                <span>Inspect Quality Checks</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="feature-card card">
            <div className="feature-card__icon feature-card__icon--purple">
              <Brain size={24} />
            </div>
            <h3 className="feature-card__title">Model Registry & Training</h3>
            <p className="feature-card__desc">
              Train Scikit-Learn regressors and classifiers with automated train/test splits, feature importances, R²/RMSE tracking, and .joblib serialization.
            </p>
            <div className="feature-card__footer">
              <Link to="/ml" className="feature-card__link">
                <span>Open ML Studio</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="feature-card card">
            <div className="feature-card__icon feature-card__icon--amber">
              <Target size={24} />
            </div>
            <h3 className="feature-card__title">Prescriptive Decision Engine</h3>
            <p className="feature-card__desc">
              Numbers mean nothing without context. The engine maps predictions to discrete operational decisions with ROI estimates and confidence levels.
            </p>
            <div className="feature-card__footer">
              <Link to="/decisions" className="feature-card__link">
                <span>Manage Decisions</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="feature-card card">
            <div className="feature-card__icon feature-card__icon--cyan">
              <RotateCcw size={24} />
            </div>
            <h3 className="feature-card__title">Continuous Feedback Loop</h3>
            <p className="feature-card__desc">
              Record real post-implementation numbers. If a decision underperforms or variance exceeds tolerance, automated retraining alerts are triggered.
            </p>
            <div className="feature-card__footer">
              <Link to="/feedback" className="feature-card__link">
                <span>Track Outcomes</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="feature-card card">
            <div className="feature-card__icon feature-card__icon--indigo">
              <BarChart3 size={24} />
            </div>
            <h3 className="feature-card__title">Interactive BI & Profiling</h3>
            <p className="feature-card__desc">
              High-performance charts using Recharts: categorical splits, timeline aggregations, and descriptive statistics without external BI bloat.
            </p>
            <div className="feature-card__footer">
              <Link to="/analytics" className="feature-card__link">
                <span>Explore BI Charts</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Architecture Overview Section ─────────────────── */}
      <section id="architecture" className="landing-section landing-section--arch">
        <div className="landing-section__header">
          <div className="badge badge--info" style={{ marginBottom: '12px' }}>
            System Blueprint
          </div>
          <h2 className="landing-section__title">Clean, Modular & Decoupled Architecture</h2>
          <p className="landing-section__subtitle">
            Every module operates as an independent service with its own domain logic, models, and schemas.
          </p>
        </div>

        <div className="arch-diagram card">
          <div className="arch-diagram__layer">
            <div className="arch-diagram__layer-label">Presentation Layer</div>
            <div className="arch-boxes">
              <div className="arch-box arch-box--highlight">React 18 + Vite (Clean White UI)</div>
              <div className="arch-box">Interactive Recharts BI</div>
              <div className="arch-box">Agentic Console</div>
            </div>
          </div>

          <div className="arch-arrow">↓ REST API (FastAPI)</div>

          <div className="arch-diagram__layer">
            <div className="arch-diagram__layer-label">Application & Domain Modules</div>
            <div className="arch-boxes arch-boxes--grid">
              <div className="arch-box">Data Engineering (ETL)</div>
              <div className="arch-box">Data Quality (Contracts)</div>
              <div className="arch-box">Analytics & Profiling</div>
              <div className="arch-box">ML Studio & Registry</div>
              <div className="arch-box">Decision Engine</div>
              <div className="arch-box">Feedback Loop</div>
            </div>
          </div>

          <div className="arch-arrow">↓ SQLAlchemy ORM</div>

          <div className="arch-diagram__layer">
            <div className="arch-diagram__layer-label">Storage & Artifact Store</div>
            <div className="arch-boxes">
              <div className="arch-box">PostgreSQL 15+ (Production)</div>
              <div className="arch-box">SQLite Fallback (Instant Dev)</div>
              <div className="arch-box">Serialized Artifacts (.joblib & CSV)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ────────────────────────────────────── */}
      <section className="landing-cta">
        <div className="landing-cta__card">
          <h2 className="landing-cta__title">
            Ready to test the full Data-to-Decision workflow?
          </h2>
          <p className="landing-cta__subtitle">
            Launch the platform right now. Zero setup required with automatic SQLite database fallback and pre-built demonstration data.
          </p>
          <div className="landing-cta__actions">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn--primary btn--lg"
            >
              <span>Launch White Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/data')}
              className="btn btn--secondary btn--lg"
            >
              <span>Upload Your Dataset</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer__container">
          <div className="landing-footer__brand">
            <div className="landing-nav__logo">
              <div className="landing-nav__logo-badge">
                <Bot size={18} style={{ color: '#fff' }} />
              </div>
              <span className="landing-nav__logo-title">Data-to-Decision OS</span>
            </div>
            <p className="landing-footer__desc">
              An open-source operating system that bridges data science, machine learning, and business decision-making.
            </p>
            <div className="landing-footer__copy">
              © {new Date().getFullYear()} Data-to-Decision OS Contributors. Licensed under MIT.
            </div>
          </div>

          <div className="landing-footer__links">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/pipeline">Pipeline Agent</Link>
              <Link to="/data">Data Engineering</Link>
              <Link to="/quality">Data Quality</Link>
            </div>
            <div className="footer-col">
              <h4>Intelligence</h4>
              <Link to="/analytics">Analytics & BI</Link>
              <Link to="/ml">ML Engineering</Link>
              <Link to="/decisions">Decisions</Link>
              <Link to="/feedback">Feedback Loop</Link>
            </div>
            <div className="footer-col">
              <h4>Open Source</h4>
              <a href="https://github.com" target="_blank" rel="noreferrer">GitHub Repository</a>
              <a href="https://github.com" target="_blank" rel="noreferrer">Contributing Guide</a>
              <a href="https://github.com" target="_blank" rel="noreferrer">License (MIT)</a>
              <a href="https://github.com" target="_blank" rel="noreferrer">Security Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
