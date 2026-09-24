import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Database, ShieldCheck, Brain, Target, RotateCcw, Activity,
  CheckCircle, ArrowRight, Sparkles, Play, Layers, ExternalLink,
  ChevronRight, RefreshCw, Zap
} from 'lucide-react';
import * as api from '../services/api';

const COLORS = ['#059669', '#0d9488', '#10b981', '#4f46e5', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await api.getDashboardOverview();
      setOverview(data);
    } catch (err) {
      console.log('Backend not connected yet — showing empty state');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickSeed() {
    setSeeding(true);
    try {
      await api.seedDemoData();
      setSeedSuccess(true);
      await loadDashboard();
      setTimeout(() => setSeedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner--lg"></div>
        <p style={{ fontWeight: 600 }}>Loading Data-to-Decision OS telemetry...</p>
      </div>
    );
  }

  const stats = [
    {
      icon: Database, label: 'Ingested Datasets', value: overview?.datasets ?? 0,
      color: 'blue', path: '/data', hint: 'View files & schemas'
    },
    {
      icon: ShieldCheck, label: 'Latest Quality Score',
      value: overview?.latest_quality_score ? `${overview.latest_quality_score}%` : '—',
      color: 'green', path: '/quality', hint: overview?.latest_quality_level || 'Data contracts'
    },
    {
      icon: Brain, label: 'Trained Models', value: overview?.models ?? 0,
      color: 'purple', path: '/ml', hint: 'Scikit-Learn Registry'
    },
    {
      icon: Target, label: 'Actionable Decisions', value: overview?.decisions ?? 0,
      color: 'orange', path: '/decisions', hint: 'Prescriptive engine'
    },
    {
      icon: RotateCcw, label: 'Decision Success Rate',
      value: overview?.feedback_stats?.success_rate ? `${overview.feedback_stats.success_rate}%` : '—',
      color: 'cyan', path: '/feedback', hint: 'Closed feedback loop'
    },
    {
      icon: Activity, label: 'Pipeline Agent Runs', value: overview?.agent_runs ?? 0,
      color: 'red', path: '/pipeline', hint: 'Autonomous runs'
    },
  ];

  // Pipeline steps status
  const pipelineSteps = [
    { key: 'data', icon: '📥', label: 'Ingestion', path: '/data', completed: (overview?.datasets ?? 0) > 0 },
    { key: 'etl', icon: '🔧', label: 'ETL / Clean', path: '/data', completed: (overview?.pipelines ?? 0) > 0 },
    { key: 'quality', icon: '✅', label: 'Quality Gates', path: '/quality', completed: (overview?.quality_reports ?? 0) > 0 },
    { key: 'analytics', icon: '📊', label: 'Analytics & BI', path: '/analytics', completed: (overview?.datasets ?? 0) > 0 },
    { key: 'ml', icon: '🤖', label: 'ML Training', path: '/ml', completed: (overview?.models ?? 0) > 0 },
    { key: 'decisions', icon: '💡', label: 'Prescriptions', path: '/decisions', completed: (overview?.decisions ?? 0) > 0 },
    { key: 'feedback', icon: '📏', label: 'Feedback Loop', path: '/feedback', completed: (overview?.feedbacks ?? 0) > 0 },
  ];

  const completedCount = pipelineSteps.filter(s => s.completed).length;

  return (
    <div className="animate-in">
      {/* ─── Header & Quick Actions Toolbar ───────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Platform Overview</h1>
          <p className="page-header__subtitle">
            Autonomous closed-loop operating system from raw data to verified decisions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleQuickSeed}
            disabled={seeding}
            className="btn btn--secondary"
            style={{
              background: seedSuccess ? '#ecfdf5' : '#ffffff',
              color: seedSuccess ? 'var(--accent-primary)' : 'var(--text-primary)',
              borderColor: seedSuccess ? '#a7f3d0' : 'var(--border-color)',
            }}
          >
            {seeding ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Seeding Data...</span>
              </>
            ) : seedSuccess ? (
              <>
                <CheckCircle size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>1,000 Records Ready!</span>
              </>
            ) : (
              <>
                <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
                <span>Seed Demo Data</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/pipeline')}
            className="btn btn--primary"
          >
            <Play size={15} />
            <span>Launch Pipeline Agent</span>
          </button>
        </div>
      </div>

      {/* ─── Interactive Pipeline Strip ───────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)', padding: '24px' }}>
        <div className="card__header" style={{ marginBottom: '18px' }}>
          <div>
            <div className="card__title">Pipeline Lifecycle & Verification</div>
            <div className="card__subtitle">Click any stage to inspect and execute its operations</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge--success">
              {completedCount} of {pipelineSteps.length} stages active
            </span>
          </div>
        </div>

        <div className="pipeline-flow">
          {pipelineSteps.map((step, i) => (
            <Fragment key={step.label}>
              <div
                onClick={() => navigate(step.path)}
                className={`pipeline-step ${step.completed ? 'pipeline-step--completed' : ''}`}
                title={`Open ${step.label}`}
              >
                <span className="pipeline-step__icon">{step.icon}</span>
                <span className="pipeline-step__label">{step.label}</span>
                {step.completed && <CheckCircle size={15} style={{ color: 'var(--accent-primary)' }} />}
              </div>
              {i < pipelineSteps.length - 1 && (
                <span className={`pipeline-arrow ${step.completed ? 'pipeline-arrow--completed' : ''}`}>
                  →
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ─── Stat Cards Grid ──────────────────────────────── */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={() => navigate(stat.path)}
              className="stat-card"
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="stat-card__icon stat-card__icon--blue">
                  <Icon size={22} />
                </div>
                <div className="stat-card__value">{stat.value}</div>
                <div className="stat-card__label">{stat.label}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {stat.hint}
                </span>
                <ChevronRight size={14} style={{ color: 'var(--accent-primary)' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Two-Column Operations & Feedback Section ─────── */}
      <div className="grid-2">
        {/* Model Registry Card */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">ML Model Registry & Inferences</div>
              <div className="card__subtitle">
                {overview?.latest_model_name ? `Active Model: ${overview.latest_model_name}` : 'No trained model active'}
              </div>
            </div>
            <button
              onClick={() => navigate('/ml')}
              className="btn btn--sm btn--secondary"
            >
              <span>ML Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {overview?.latest_model_metrics ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                {Object.entries(overview.latest_model_metrics)
                  .filter(([key]) => ['r2_score', 'rmse', 'mae', 'accuracy'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {key.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                        {typeof value === 'number' ? value.toFixed(3) : value}
                      </div>
                    </div>
                  ))}
              </div>

              <div>
                {Object.entries(overview.latest_model_metrics)
                  .filter(([key]) => !['feature_importance', 'task', 'r2_score', 'rmse', 'mae', 'accuracy'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{key}</span>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{typeof value === 'number' ? value.toFixed(4) : value}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">🧠</div>
              <p className="empty-state__text">Train your first predictive model to see real evaluation metrics</p>
              <button
                onClick={() => navigate('/ml')}
                className="btn btn--primary btn--sm"
                style={{ marginTop: '16px' }}
              >
                <span>Train Model in 1 Click</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback Summary Card */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Decision Feedback & ROI Tracking</div>
              <div className="card__subtitle">Verified business outcomes vs expected forecasts</div>
            </div>
            <button
              onClick={() => navigate('/feedback')}
              className="btn btn--sm btn--secondary"
            >
              <span>Feedback Loop</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {overview?.feedback_stats?.total > 0 ? (
            <div>
              <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
                <div style={{ fontSize: '3.2rem', fontWeight: 900, color: 'var(--accent-primary)', lineHeight: 1 }}>
                  {overview.feedback_stats.success_rate}%
                </div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>
                  Decision Success Rate
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Based on {overview.feedback_stats.total} executed business actions
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#047857' }}>
                    {overview.feedback_stats.successful}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#065f46' }}>
                    Positive ROI Decisions
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626' }}>
                    {overview.feedback_stats.failed}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#991b1b' }}>
                    Flagged For Drift
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon">📏</div>
              <p className="empty-state__text">
                Generate and execute decisions to close the loop with automated ROI measurements
              </p>
              <button
                onClick={() => navigate('/decisions')}
                className="btn btn--primary btn--sm"
                style={{ marginTop: '16px' }}
              >
                <span>View Decisions</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
