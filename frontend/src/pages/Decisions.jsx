import { useState, useEffect } from 'react';
import { Target, CheckCircle, Play, Clock } from 'lucide-react';
import * as api from '../services/api';

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

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Decision Engine</h1>
        <p className="page-header__subtitle">Transform ML predictions into actionable recommendations</p>
      </div>

      {decisions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state__icon">💡</div>
            <p className="empty-state__title">No decisions yet</p>
            <p className="empty-state__text">
              Run the full pipeline from the Pipeline Agent page to generate decisions from your data
            </p>
          </div>
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
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Est. Impact: {d.impact_estimate.toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="decision-card__actions">
                {d.status === 'proposed' && (
                  <button className="btn btn--primary btn--sm" onClick={() => approve(d.id)}>
                    ✓ Approve
                  </button>
                )}
                {d.status === 'approved' && (
                  <button className="btn btn--success btn--sm" onClick={() => execute(d.id)}>
                    ▶ Execute
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

      {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
