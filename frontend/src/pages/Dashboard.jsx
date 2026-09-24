import { useState, useEffect, Fragment } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Database, ShieldCheck, Brain, Target, RotateCcw, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import * as api from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner--lg"></div>
        <p>Loading platform data...</p>
      </div>
    );
  }

  const stats = [
    {
      icon: Database, label: 'Datasets', value: overview?.datasets ?? 0,
      color: 'blue', trend: null
    },
    {
      icon: ShieldCheck, label: 'Quality Score',
      value: overview?.latest_quality_score ? `${overview.latest_quality_score}%` : '—',
      color: 'green', trend: overview?.latest_quality_level
    },
    {
      icon: Brain, label: 'ML Models', value: overview?.models ?? 0,
      color: 'purple', trend: null
    },
    {
      icon: Target, label: 'Decisions', value: overview?.decisions ?? 0,
      color: 'orange', trend: null
    },
    {
      icon: RotateCcw, label: 'Success Rate',
      value: overview?.feedback_stats?.success_rate ? `${overview.feedback_stats.success_rate}%` : '—',
      color: 'cyan', trend: null
    },
    {
      icon: Activity, label: 'Pipeline Runs', value: overview?.agent_runs ?? 0,
      color: 'red', trend: null
    },
  ];

  // Pipeline steps status
  const pipelineSteps = [
    { icon: '📥', label: 'Ingestion', completed: (overview?.datasets ?? 0) > 0 },
    { icon: '🔧', label: 'ETL', completed: (overview?.pipelines ?? 0) > 0 },
    { icon: '✅', label: 'Quality', completed: (overview?.quality_reports ?? 0) > 0 },
    { icon: '📊', label: 'Analytics', completed: (overview?.datasets ?? 0) > 0 },
    { icon: '🤖', label: 'ML Model', completed: (overview?.models ?? 0) > 0 },
    { icon: '💡', label: 'Decision', completed: (overview?.decisions ?? 0) > 0 },
    { icon: '📏', label: 'Feedback', completed: (overview?.feedbacks ?? 0) > 0 },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Platform Overview</h1>
        <p className="page-header__subtitle">
          End-to-end pipeline status — from raw data to measured decisions
        </p>
      </div>

      {/* Pipeline Flow */}
      <div className="card card--no-hover" style={{ marginBottom: 'var(--space-2xl)', padding: 'var(--space-lg) var(--space-md)' }}>
        <div className="card__header">
          <div>
            <div className="card__title">Pipeline Flow</div>
            <div className="card__subtitle">Data → Decision → Feedback</div>
          </div>
          <span className="badge badge--info">
            {pipelineSteps.filter(s => s.completed).length}/{pipelineSteps.length} steps
          </span>
        </div>
        <div className="pipeline-flow">
          {pipelineSteps.map((step, i) => (
            <Fragment key={step.label}>
              <div className={`pipeline-step ${step.completed ? 'pipeline-step--completed' : ''}`}>
                <span className="pipeline-step__icon">{step.icon}</span>
                <span className="pipeline-step__label">{step.label}</span>
                {step.completed && <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />}
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

      {/* KPI Stats */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className={`stat-card__icon stat-card__icon--${stat.color}`}>
                <Icon size={22} />
              </div>
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
              {stat.trend && (
                <span className={`badge badge--${stat.trend === 'excellent' ? 'success' : stat.trend === 'good' ? 'info' : 'warning'}`} style={{ marginTop: '8px' }}>
                  {stat.trend}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="grid-2">
        {/* Model Performance */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Latest Model</div>
              <div className="card__subtitle">{overview?.latest_model_name ?? 'No models trained yet'}</div>
            </div>
          </div>
          {overview?.latest_model_metrics ? (
            <div>
              {Object.entries(overview.latest_model_metrics)
                .filter(([key]) => key !== 'feature_importance' && key !== 'task')
                .map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{typeof value === 'number' ? value.toFixed(4) : value}</span>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <div className="empty-state__icon">🧠</div>
              <p className="empty-state__text">Train your first model to see metrics here</p>
            </div>
          )}
        </div>

        {/* Feedback Summary */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Decision Feedback</div>
              <div className="card__subtitle">How well are decisions performing?</div>
            </div>
          </div>
          {overview?.feedback_stats?.total > 0 ? (
            <div>
              <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, background: 'var(--gradient-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {overview.feedback_stats.success_rate}%
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Decision Success Rate</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-md)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {overview.feedback_stats.successful}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Successful</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                    {overview.feedback_stats.failed}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Failed</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <div className="empty-state__icon">📏</div>
              <p className="empty-state__text">Record feedback on decisions to track their real-world impact</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
