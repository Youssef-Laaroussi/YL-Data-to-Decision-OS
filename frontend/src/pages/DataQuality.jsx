import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import * as api from '../services/api';

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

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Data Quality</h1>
        <p className="page-header__subtitle">Validate, detect anomalies, and enforce data contracts</p>
      </div>

      {/* Run Quality Check */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div className="card__title">Run Quality Check</div>
        </div>
        {datasets.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
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
              >
                <ShieldCheck size={16} /> {d.name}
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
              <div className="card__title">Quality Report</div>
              <div className="card__subtitle">Dataset #{selectedReport.dataset_id}</div>
            </div>
            <span className={`badge badge--${selectedReport.level === 'excellent' ? 'success' : selectedReport.level === 'good' ? 'info' : selectedReport.level === 'warning' ? 'warning' : 'danger'}`}>
              {selectedReport.level}
            </span>
          </div>

          {/* Overall Score */}
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
            <div style={{
              fontSize: '4rem', fontWeight: 800,
              background: selectedReport.overall_score >= 70 ? 'var(--gradient-success)' : 'var(--gradient-warm)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {selectedReport.overall_score}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Overall Quality Score</div>
            <div className="quality-meter" style={{ maxWidth: '400px', margin: 'var(--space-md) auto' }}>
              <div className="quality-meter__bar">
                <div
                  className={`quality-meter__fill quality-meter__fill--${getScoreColor(selectedReport.overall_score)}`}
                  style={{ width: `${selectedReport.overall_score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Individual Checks */}
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

          {/* Summary Stats */}
          <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-xl)', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-orange)' }}>
                {selectedReport.duplicate_count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duplicates</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-red)' }}>
                {selectedReport.anomaly_count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Anomalies</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedReport.schema_valid ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {selectedReport.schema_valid ? '✓' : '✗'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schema Valid</div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Reports */}
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
