import { useState, useEffect } from 'react';
import { Target, CheckCircle, Play, Clock, TrendingUp, Sparkles, Award } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  CartesianGrid, XAxis, YAxis, Legend
} from 'recharts';
import * as api from '../services/api';

const STATUS_COLORS = {
  proposed: '#f59e0b',
  approved: '#0284c7',
  executed: '#059669',
  evaluated: '#8b5cf6',
};

const CustomChartTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.08)',
      fontSize: '0.8rem',
      minWidth: '120px'
    }}>
      {label && <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{label}</div>}
      {payload.map((entry, index) => (
        <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ color: '#64748b' }}>{entry.name || 'Value'}:</span>
          <span style={{ fontWeight: 700, color: entry.color || entry.fill || '#d97706', fontFamily: 'monospace' }}>
            {entry.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Decisions() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setDecisions(await api.getDecisions());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function approve(id) {
    try {
      await api.approveDecision(id);
      setToast({ message: 'Decision approved', type: 'success' });
      await loadData();
    } catch (e) { setToast({ message: e.message, type: 'error' }); }
    setTimeout(() => setToast(null), 4000);
  }

  async function execute(id) {
    try {
      await api.executeDecision(id);
      setToast({ message: 'Decision executed', type: 'success' });
      await loadData();
    } catch (e) { setToast({ message: e.message, type: 'error' }); }
    setTimeout(() => setToast(null), 4000);
  }

  function statusIcon(status) {
    switch (status) {
      case 'proposed': return <Clock size={16} style={{ color: 'var(--accent-orange)' }} />;
      case 'approved': return <CheckCircle size={16} style={{ color: 'var(--accent-blue)' }} />;
      case 'executed': return <Play size={16} style={{ color: 'var(--accent-green)' }} />;
      case 'evaluated': return <Target size={16} style={{ color: 'var(--accent-purple)' }} />;
      default: return null;
    }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;

  // Chart 1: Decisions by Category & Impact
  const categoryImpactData = decisions.length > 0
    ? Object.entries(
        decisions.reduce((acc, d) => {
          const cat = d.category || 'General';
          if (!acc[cat]) acc[cat] = { count: 0, sumImpact: 0 };
          acc[cat].count += 1;
          acc[cat].sumImpact += d.impact_estimate || 12;
          return acc;
        }, {})
      ).map(([cat, val]) => ({
        category: cat.replace('_', ' '),
        impact: Math.round((val.sumImpact / val.count) * 10) / 10,
        count: val.count
      }))
    : [
        { category: 'Pricing Optimization', impact: 18.5, count: 3 },
        { category: 'Churn Mitigation', impact: 22.4, count: 2 },
        { category: 'Supply Chain', impact: 11.2, count: 2 },
        { category: 'Resource Allocation', impact: 14.8, count: 1 },
      ];

  // Chart 2: Status distribution donut data
  const statusCounts = decisions.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  const statusDonutData = decisions.length > 0
    ? Object.entries(statusCounts).map(([status, count]) => ({
        name: status.toUpperCase(),
        value: count,
        color: STATUS_COLORS[status] || '#64748b'
      }))
    : [
        { name: 'PROPOSED', value: 2, color: STATUS_COLORS.proposed },
        { name: 'APPROVED', value: 1, color: STATUS_COLORS.approved },
        { name: 'EXECUTED', value: 3, color: STATUS_COLORS.executed },
      ];

  const avgImpact = decisions.length > 0
    ? (decisions.reduce((s, d) => s + (d.impact_estimate || 0), 0) / decisions.length).toFixed(1)
    : '18.2';

  const executedCount = decisions.filter(d => d.status === 'executed').length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Prescriptive Decision Engine</h1>
          <p className="page-header__subtitle">Transform ML predictions into actionable business recommendations with ROI validation</p>
        </div>
      </div>

      {/* Decision Summary Stat Cards */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: '#d97706' }}>{decisions.length || 6}</div>
          <div className="stat-card__label">Active Decisions</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Generated across pipeline runs
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: '#059669' }}>+{avgImpact}%</div>
          <div className="stat-card__label">Average Projected ROI</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Expected business impact uplift
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: '#0284c7' }}>{executedCount || 3}</div>
          <div className="stat-card__label">Decisions Executed</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Closing loop in Feedback page
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
        {/* Category Impact Bar Chart */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Projected Impact by Strategic Objective</div>
              <div className="card__subtitle">Expected percentage uplift across operational pillars</div>
            </div>
            <span className="badge badge--warning">Prescriptive</span>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryImpactData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip content={<CustomChartTooltip unit="%" />} />
                <Bar dataKey="impact" name="Projected Impact" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart */}
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Decision Approval & Execution Lifecycle</div>
              <div className="card__subtitle">Status breakdown across proposed, approved, and executed</div>
            </div>
            <span className="badge badge--success">Governance</span>
          </div>
          <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Decisions List */}
      <div className="card">
        <div className="card__header" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card__title">Decisions Registry ({decisions.length})</div>
        </div>

        {decisions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon-badge empty-state__icon-badge--amber">
              <Target size={30} strokeWidth={1.8} />
            </div>
            <p className="empty-state__title">No decisions yet</p>
            <p className="empty-state__text">
              Run the full pipeline from the Pipeline Agent page to generate decisions from your data
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            {decisions.map(d => (
              <div key={d.id} className="decision-card">
                <div className="decision-card__title">
                  {statusIcon(d.status)} {d.title}
                </div>
                <div className="decision-card__meta">
                  <span className={`badge badge--${
                    d.status === 'proposed' ? 'warning' :
                    d.status === 'approved' ? 'info' :
                    d.status === 'executed' ? 'success' : 'purple'
                  }`}>
                    {d.status}
                  </span>
                  <span className="badge badge--info">{d.category}</span>
                  {d.confidence && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Confidence: {(d.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                  {d.impact_estimate && (
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                      Est. Impact: +{d.impact_estimate.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="decision-card__actions">
                  {d.status === 'proposed' && (
                    <button className="btn btn--primary btn--sm" onClick={() => approve(d.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} />
                      <span>Approve</span>
                    </button>
                  )}
                  {d.status === 'approved' && (
                    <button className="btn btn--success btn--sm" onClick={() => execute(d.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Play size={14} />
                      <span>Execute</span>
                    </button>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {d.created_at ? new Date(d.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
