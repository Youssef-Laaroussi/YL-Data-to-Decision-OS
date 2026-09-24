import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import * as api from '../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-secondary)', padding: '12px 16px',
      border: '1px solid var(--border-color)', borderRadius: '8px',
      fontSize: '0.8rem', boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [datasets, setDatasets] = useState([]);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setDatasets(await api.getDatasets());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function analyze(datasetId) {
    setAnalyzing(true);
    try {
      const result = await api.runAnalysis(datasetId);
      setSnapshot(result);
      setToast({ message: 'Analysis complete', type: 'success' });
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
    setAnalyzing(false);
    setTimeout(() => setToast(null), 4000);
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;

  // Prepare chart data from snapshot
  const numericStats = snapshot?.summary_stats
    ? Object.entries(snapshot.summary_stats).filter(([, v]) => v.mean !== undefined)
    : [];

  const categoricalStats = snapshot?.summary_stats
    ? Object.entries(snapshot.summary_stats).filter(([, v]) => v.unique !== undefined)
    : [];

  const correlationData = snapshot?.correlations
    ? Object.entries(snapshot.correlations).map(([col, corrs]) => ({
        column: col,
        ...corrs,
      }))
    : [];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Analytics & BI</h1>
        <p className="page-header__subtitle">Statistical exploration, distributions, and data insights</p>
      </div>

      {/* Dataset Selection */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div className="card__title">Analyze Dataset</div>
        </div>
        {datasets.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <p className="empty-state__text">Upload a dataset first in Data Engineering</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            {datasets.map(d => (
              <button key={d.id} className="btn btn--primary" onClick={() => analyze(d.id)} disabled={analyzing}>
                {analyzing ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : '📊'} {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {snapshot && (
        <>
          {/* Summary Statistics Table */}
          {numericStats.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
              <div className="card__header">
                <div className="card__title">Summary Statistics</div>
                <span className="badge badge--info">{numericStats.length} numeric columns</span>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Column</th><th>Mean</th><th>Median</th><th>Std Dev</th>
                      <th>Min</th><th>Max</th><th>Skewness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numericStats.map(([col, s]) => (
                      <tr key={col}>
                        <td style={{ fontWeight: 600 }}>{col}</td>
                        <td>{s.mean?.toLocaleString()}</td>
                        <td>{s.median?.toLocaleString()}</td>
                        <td>{s.std?.toLocaleString()}</td>
                        <td>{s.min?.toLocaleString()}</td>
                        <td>{s.max?.toLocaleString()}</td>
                        <td>
                          <span className={`badge badge--${Math.abs(s.skewness) < 0.5 ? 'success' : Math.abs(s.skewness) < 1 ? 'warning' : 'danger'}`}>
                            {s.skewness}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Distribution Charts */}
            {Object.entries(snapshot.distributions || {}).slice(0, 4).map(([col, dist]) => (
              <div key={col} className="card">
                <div className="card__header">
                  <div className="card__title">{col}</div>
                  <span className="badge badge--purple">{dist.histogram ? 'Distribution' : 'Categories'}</span>
                </div>
                <div className="chart-container">
                  {dist.histogram ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dist.histogram.counts.map((c, i) => ({
                        range: dist.histogram.bin_edges[i]?.toFixed(1),
                        count: c,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : dist.value_counts ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(dist.value_counts).map(([k, v]) => ({ name: k, value: v }))}
                          cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                          paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {Object.keys(dist.value_counts).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            ))}

            {/* Trends */}
            {Object.entries(snapshot.trends || {}).map(([col, trend]) => (
              <div key={col} className="card">
                <div className="card__header">
                  <div className="card__title">{col} — Trend</div>
                  <span className="badge badge--success">Time Series</span>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend.dates.map((d, i) => ({ date: d, value: trend.values[i] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
