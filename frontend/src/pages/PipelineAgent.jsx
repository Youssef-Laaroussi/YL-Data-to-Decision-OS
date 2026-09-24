import { useState, useEffect, Fragment } from 'react';
import { Bot, Play, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import * as api from '../services/api';

const PIPELINE_STEPS = [
  { key: 'data_engineering', label: 'Data Engineering', icon: '🔧', description: 'Clean, transform, optimize' },
  { key: 'data_quality', label: 'Data Quality', icon: '✅', description: 'Validate, detect anomalies' },
  { key: 'analytics', label: 'Analytics', icon: '📊', description: 'Statistical analysis' },
  { key: 'ml_training', label: 'ML Training', icon: '🧠', description: 'Train predictive model' },
  { key: 'prediction', label: 'Prediction', icon: '🎯', description: 'Generate predictions' },
  { key: 'decision_engine', label: 'Decision', icon: '💡', description: 'Actionable recommendation' },
];

export default function PipelineAgent() {
  const [datasets, setDatasets] = useState([]);
  const [runs, setRuns] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [algorithm, setAlgorithm] = useState('random_forest_regressor');
  const [columns, setColumns] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ds, rn] = await Promise.all([api.getDatasets(), api.getAgentRuns()]);
      setDatasets(ds);
      setRuns(rn);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDatasetSelect(id) {
    setSelectedDataset(id);
    if (id) {
      try {
        const preview = await api.previewDataset(parseInt(id), 5);
        setColumns(preview.columns);
      } catch (e) { console.error(e); }
    }
  }

  async function runPipeline() {
    if (!selectedDataset || !targetColumn) return;
    setRunning(true);
    try {
      const result = await api.runAgentPipeline({
        dataset_id: parseInt(selectedDataset),
        target_column: targetColumn,
        algorithm,
        decision_context: 'default',
      });
      setCurrentRun(result);
      setToast({
        message: result.status === 'completed'
          ? '🎉 Full pipeline completed successfully!'
          : `Pipeline ${result.status}`,
        type: result.status === 'completed' ? 'success' : 'error'
      });
      await loadData();
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
    setRunning(false);
    setTimeout(() => setToast(null), 5000);
  }

  async function viewRun(runId) {
    try {
      const run = await api.getAgentRun(runId);
      setCurrentRun(run);
    } catch (e) { console.error(e); }
  }

  function getStepStatus(stepKey) {
    if (!currentRun) return 'pending';
    if (currentRun.steps_completed?.includes(stepKey)) return 'completed';
    if (currentRun.current_step === stepKey) return 'running';
    return 'pending';
  }

  function getStepDetail(stepKey) {
    if (!currentRun?.log) return null;
    return currentRun.log.find(l => l.step === stepKey && l.status === 'completed');
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">
          <Bot size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
          Pipeline Agent
        </h1>
        <p className="page-header__subtitle">
          Autonomous pipeline orchestration — Data → Quality → Analytics → ML → Decision
        </p>
      </div>

      {/* Launch Pipeline */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div className="card__header">
          <div>
            <div className="card__title">🚀 Launch Full Pipeline</div>
            <div className="card__subtitle">The agent will run all steps autonomously</div>
          </div>
        </div>

        {datasets.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <div className="empty-state__icon">📂</div>
            <p className="empty-state__title">No data uploaded yet</p>
            <p className="empty-state__text">Go to Data Engineering to upload a CSV or JSON dataset first</p>
          </div>
        ) : (
          <>
            <div className="grid-3" style={{ gap: 'var(--space-lg)' }}>
              <div className="form-group">
                <label className="form-label">Dataset</label>
                <select className="form-select" value={selectedDataset} onChange={(e) => handleDatasetSelect(e.target.value)}>
                  <option value="">Select dataset</option>
                  {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.row_count} rows)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Column (to predict)</label>
                <select className="form-select" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} disabled={!columns.length}>
                  <option value="">Select target</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Algorithm</label>
                <select className="form-select" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                  <option value="random_forest_regressor">Random Forest (Regression)</option>
                  <option value="random_forest_classifier">Random Forest (Classification)</option>
                  <option value="linear_regression">Linear Regression</option>
                  <option value="logistic_regression">Logistic Regression</option>
                </select>
              </div>
            </div>
            <button
              className="btn btn--primary btn--lg"
              onClick={runPipeline}
              disabled={!selectedDataset || !targetColumn || running}
              style={{ width: '100%', marginTop: 'var(--space-md)', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
            >
              {running ? (
                <><div className="spinner" style={{ width: 20, height: 20, borderTopColor: 'white' }}></div> Agent is running the pipeline...</>
              ) : (
                '🤖 Run Full Pipeline (Data → Decision)'
              )}
            </button>
          </>
        )}
      </div>

      {/* Pipeline Progress */}
      {currentRun && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="card__header">
            <div>
              <div className="card__title">Pipeline Run #{currentRun.id}</div>
              <div className="card__subtitle">
                {currentRun.started_at ? new Date(currentRun.started_at).toLocaleString() : ''}
              </div>
            </div>
            <span className={`badge badge--${currentRun.status === 'completed' ? 'success' : currentRun.status === 'failed' ? 'danger' : 'info'}`}>
              {currentRun.status}
            </span>
          </div>

          {/* Visual Pipeline Steps */}
          <div className="pipeline-flow" style={{ marginBottom: 'var(--space-xl)' }}>
            {PIPELINE_STEPS.map((step, i) => {
              const status = getStepStatus(step.key);
              return (
                <Fragment key={step.key}>
                  <div className={`pipeline-step pipeline-step--${status}`}>
                    <span className="pipeline-step__icon">{step.icon}</span>
                    <span className="pipeline-step__label">{step.label}</span>
                    {status === 'completed' && <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />}
                    {status === 'running' && <Loader size={14} style={{ color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <span className={`pipeline-arrow ${status === 'completed' ? 'pipeline-arrow--completed' : ''}`}>→</span>
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* Execution Log */}
          <div className="agent-log">
            {currentRun.log?.filter(l => l.status === 'completed' || l.status === 'failed').map((entry, i) => (
              <div key={i} className={`agent-log__entry agent-log__entry--${entry.status === 'completed' ? 'completed' : 'failed'}`}>
                <div className="agent-log__step">
                  {entry.status === 'completed' ? <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} /> : <XCircle size={14} style={{ color: 'var(--accent-red)' }} />}
                  <span style={{ marginLeft: '8px' }}>{entry.step.replace('_', ' ')}</span>
                </div>
                <div className="agent-log__details">
                  {entry.score && <span>Score: {entry.score}% </span>}
                  {entry.level && <span className={`badge badge--${entry.level === 'excellent' ? 'success' : 'info'}`} style={{ marginRight: '8px' }}>{entry.level}</span>}
                  {entry.metrics && Object.entries(entry.metrics).filter(([k]) => k !== 'feature_importance' && k !== 'task').map(([k, v]) => (
                    <span key={k} style={{ marginRight: '8px' }}>{k}: <strong>{typeof v === 'number' ? v.toFixed(4) : v}</strong></span>
                  ))}
                  {entry.decision_title && <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>→ "{entry.decision_title}"</span>}
                  {entry.prediction_value != null && <span>Prediction: <strong>{entry.prediction_value.toFixed(4)}</strong></span>}
                  {entry.error && <span style={{ color: 'var(--accent-red)' }}>{entry.error}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Decision Output */}
          {currentRun.decision_id && currentRun.status === 'completed' && (
            <div style={{
              marginTop: 'var(--space-xl)', padding: 'var(--space-lg)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))',
              borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-green)', marginBottom: '8px' }}>
                ✨ Decision Generated
              </div>
              {currentRun.log?.filter(l => l.decision_title).map((l, i) => (
                <div key={i} style={{ fontSize: '1.3rem', fontWeight: 700 }}>{l.decision_title}</div>
              ))}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Go to the Decision Engine page to approve and execute this decision, then track its impact in the Feedback Loop.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Previous Runs */}
      {runs.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Previous Runs ({runs.length})</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Status</th><th>Steps</th><th>Trigger</th><th>Started</th><th>Action</th></tr>
              </thead>
              <tbody>
                {runs.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td><span className={`badge badge--${r.status === 'completed' ? 'success' : r.status === 'failed' ? 'danger' : 'info'}`}>{r.status}</span></td>
                    <td>{r.steps_completed?.length ?? 0}/{PIPELINE_STEPS.length}</td>
                    <td>{r.trigger}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.started_at ? new Date(r.started_at).toLocaleString() : '—'}</td>
                    <td><button className="btn btn--ghost btn--sm" onClick={() => viewRun(r.id)}>View</button></td>
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
