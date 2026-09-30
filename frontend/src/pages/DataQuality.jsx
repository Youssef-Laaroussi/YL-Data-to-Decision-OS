import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, TrendingUp, BarChart3, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, ReferenceLine, Cell
} from 'recharts';
import * as api from '../services/api';

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
          <span style={{ fontWeight: 700, color: entry.color || '#059669', fontFamily: 'monospace' }}>
            {entry.value} {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DataQuality() {
  const [datasets, setDatasets] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ds, rp] = await Promise.all([api.getDatasets(), api.getQualityReports()]);
      setDatasets(ds);
      setReports(rp);
      if (rp.length > 0 && !selectedReport) {
        setSelectedReport(rp[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function runCheck(datasetId) {
    setRunning(true);
    try {
      const report = await api.runQualityCheck(datasetId);
      setSelectedReport(report);
      setToast({ message: `Quality check complete — Score: ${report.overall_score}%`, type: 'success' });
      await loadData();
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
    setRunning(false);
    setTimeout(() => setToast(null), 4000);
  }

  function getScoreColor(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  }

  function getCheckIcon(status) {
    if (status === 'pass') return <CheckCircle size={16} style={{ color: 'var(--accent-green)' }} />;
    if (status === 'warning') return <AlertTriangle size={16} style={{ color: 'var(--accent-orange)' }} />;
    return <XCircle size={16} style={{ color: 'var(--accent-red)' }} />;
  }

  if (loading) {
    return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;
  }

  // Historical trend data
  const historyData = reports.length > 0
    ? reports.slice(0, 8).reverse().map((r, i) => ({
        name: `Run #${r.id}`,
        score: r.overall_score,
        anomalies: r.anomaly_count || 0,
        duplicates: r.duplicate_count || 0
      }))
    : [
        { name: 'Check #1', score: 88, anomalies: 3, duplicates: 1 },
        { name: 'Check #2', score: 92, anomalies: 2, duplicates: 0 },
        { name: 'Check #3', score: 95, anomalies: 1, duplicates: 0 },
        { name: 'Check #4', score: 98, anomalies: 0, duplicates: 0 },
      ];

  // Selected report checks data for horizontal bar chart
  const checksChartData = selectedReport?.checks?.map(c => ({
    name: c.name.length > 20 ? c.name.slice(0, 18) + '...' : c.name,
    score: c.score,
    status: c.status
  })) || [];

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Data Quality & Health Gates</h1>
          <p className="page-header__subtitle">Validate schema contracts, detect statistical drift, and gate pipeline errors</p>
        </div>
      </div>

      {/* Run Quality Check */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div>
            <div className="card__title">Run Automated Quality Audit</div>
            <div className="card__subtitle">Select an ingested dataset to execute validation rules</div>
          </div>
        </div>
        {datasets.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <div className="empty-state__icon-badge empty-state__icon-badge--teal">
              <ShieldCheck size={28} strokeWidth={1.8} />
            </div>
            <p className="empty-state__title">No datasets available</p>
            <p className="empty-state__text">Upload a dataset first in Data Engineering</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            {datasets.map(d => (
              <button
                key={d.id}
                className="btn btn--secondary"
                onClick={() => runCheck(d.id)}
                disabled={running}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <ShieldCheck size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>{d.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quality Report Detail */}
      {selectedReport && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="card__header">
            <div>
              <div className="card__title">Quality Report — Dataset #{selectedReport.dataset_id}</div>
              <div className="card__subtitle">
                {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString() : 'Audited just now'}
              </div>
            </div>
            <span className={`badge badge--${selectedReport.level === 'excellent' ? 'success' : selectedReport.level === 'good' ? 'info' : selectedReport.level === 'warning' ? 'warning' : 'danger'}`}>
              {selectedReport.level}
            </span>
          </div>

          <div className="grid-2" style={{ gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            {/* Overall Score + Meter */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '4.2rem', fontWeight: 900, lineHeight: 1,
                color: selectedReport.overall_score >= 85 ? '#059669' : selectedReport.overall_score >= 70 ? '#0284c7' : '#d97706',
              }}>
                {selectedReport.overall_score}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '8px' }}>
                Overall Quality Health Score
              </div>
              <div className="quality-meter" style={{ width: '100%', maxWidth: '280px', margin: '14px auto 0' }}>
                <div className="quality-meter__bar">
                  <div
                    className={`quality-meter__fill quality-meter__fill--${getScoreColor(selectedReport.overall_score)}`}
                    style={{ width: `${selectedReport.overall_score}%` }}
                  ></div>
                </div>
              </div>

              {/* Summary Stats */}
              <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: '20px', width: '100%', justifyContent: 'space-around' }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
                    {selectedReport.duplicate_count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duplicates</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                    {selectedReport.anomaly_count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anomalies</div>
                </div>
                <div>
                  <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedReport.schema_valid ? (
                      <CheckCircle size={24} style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <XCircle size={24} style={{ color: 'var(--accent-red)' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schema Valid</div>
                </div>
              </div>
            </div>

            {/* Checks Score Bar Chart */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Rule Compliance by Dimension
              </div>
              <div style={{ width: '100%', height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={checksChartData} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={110} />
                    <Tooltip content={<CustomChartTooltip unit="%" />} />
                    <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
                      {checksChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.score >= 90 ? '#059669' : entry.score >= 70 ? '#0284c7' : '#d97706'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Individual Checks List */}
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {selectedReport.checks?.map((check, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-md)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}>
                {getCheckIcon(check.status)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{check.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{check.description}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{check.score}%</div>
                  <span className={`badge badge--${check.status === 'pass' ? 'success' : check.status === 'warning' ? 'warning' : 'danger'}`}>
                    {check.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Trend Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div>
            <div className="card__title">Historical Health Trend Across Runs</div>
            <div className="card__subtitle">Quality score trajectory vs 85% production compliance threshold</div>
          </div>
          <span className="badge badge--success">
            Continuous Monitoring
          </span>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip content={<CustomChartTooltip unit="%" />} />
              <ReferenceLine y={85} stroke="#d97706" strokeDasharray="4 4" label={{ value: 'Gate Threshold (85%)', fill: '#d97706', fontSize: 10, position: 'insideTopLeft' }} />
              <Area type="monotone" dataKey="score" name="Quality Score" stroke="#059669" strokeWidth={2.5} fill="url(#dqGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Previous Reports Table */}
      {reports.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Report History ({reports.length})</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Checks</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>Dataset #{r.dataset_id}</td>
                    <td>
                      <div className="quality-meter" style={{ minWidth: '120px' }}>
                        <div className="quality-meter__bar">
                          <div className={`quality-meter__fill quality-meter__fill--${getScoreColor(r.overall_score)}`}
                            style={{ width: `${r.overall_score}%` }}></div>
                        </div>
                        <span className="quality-meter__value">{r.overall_score}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge--${r.level === 'excellent' ? 'success' : r.level === 'good' ? 'info' : 'warning'}`}>{r.level}</span></td>
                    <td>{r.checks?.length ?? 0}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                    <td><button className="btn btn--ghost btn--sm" onClick={() => setSelectedReport(r)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
