import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as api from '../services/api';

const COLORS = ['#10b981', '#ef4444'];

export default function FeedbackLoop() {
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [formDecision, setFormDecision] = useState('');
  const [formOutcome, setFormOutcome] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [st, fb, dc] = await Promise.all([
        api.getFeedbackStats(),
        api.getAllFeedback(),
        api.getDecisions(),
      ]);
      setStats(st);
      setFeedbacks(fb);
      setDecisions(dc.filter(d => d.status === 'executed'));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function submitFeedback() {
    if (!formDecision || !formOutcome) return;
    try {
      await api.recordFeedback({
        decision_id: parseInt(formDecision),
        actual_outcome: parseFloat(formOutcome),
        notes: formNotes || null,
      });
      setToast({ message: 'Feedback recorded!', type: 'success' });
      setFormDecision(''); setFormOutcome(''); setFormNotes('');
      await loadData();
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
    setTimeout(() => setToast(null), 4000);
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;

  const pieData = stats?.total > 0 ? [
    { name: 'Successful', value: stats.successful },
    { name: 'Failed', value: stats.failed },
  ] : [];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Feedback Loop</h1>
        <p className="page-header__subtitle">Measure decision impact — did the decision actually work?</p>
      </div>

      {/* Stats Overview */}
      <div className="grid-3" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="stat-card" style={{ '--stat-accent': 'var(--gradient-success)' }}>
          <div className="stat-card__value" style={{ color: 'var(--accent-green)' }}>
            {stats?.success_rate ?? 0}%
          </div>
          <div className="stat-card__label">Success Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{stats?.total ?? 0}</div>
          <div className="stat-card__label">Total Evaluated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--accent-orange)' }}>
            {stats?.avg_variance_pct ?? 0}%
          </div>
          <div className="stat-card__label">Avg Variance</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
        {/* Success Donut */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Success Distribution</div>
          </div>
          {pieData.length > 0 ? (
            <div className="chart-container" style={{ height: '250px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <p className="empty-state__text">Record feedback to see distribution</p>
            </div>
          )}
        </div>

        {/* Record Feedback Form */}
        <div className="card">
          <div className="card__header">
            <div className="card__title">Record Feedback</div>
          </div>
          {decisions.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
              <p className="empty-state__text">Execute a decision first to provide feedback</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Decision</label>
                <select className="form-select" value={formDecision} onChange={(e) => setFormDecision(e.target.value)}>
                  <option value="">Select decision</option>
                  {decisions.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Actual Outcome (numeric)</label>
                <input type="number" className="form-input" placeholder="e.g. 12.5" value={formOutcome} onChange={(e) => setFormOutcome(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" placeholder="What happened?" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
              </div>
              <button className="btn btn--primary" onClick={submitFeedback} disabled={!formDecision || !formOutcome}>
                📏 Record Feedback
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feedback History */}
      {feedbacks.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Feedback History</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Decision</th><th>Expected</th><th>Actual</th><th>Variance</th><th>Result</th><th>Date</th></tr>
              </thead>
              <tbody>
                {feedbacks.map(f => (
                  <tr key={f.id}>
                    <td>Decision #{f.decision_id}</td>
                    <td>{f.expected_outcome?.toFixed(1)}</td>
                    <td style={{ fontWeight: 600 }}>{f.actual_outcome?.toFixed(1)}</td>
                    <td><span className={`badge badge--${Math.abs(f.variance_pct) < 20 ? 'success' : 'warning'}`}>{f.variance_pct?.toFixed(1)}%</span></td>
                    <td>{f.success ? <span className="badge badge--success">✓ Success</span> : <span className="badge badge--danger">✗ Failed</span>}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.measured_at ? new Date(f.measured_at).toLocaleString() : '—'}</td>
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
