import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as api from '../services/api';

const ALGORITHMS = [
  { value: 'random_forest_regressor', label: 'Random Forest (Regression)' },
  { value: 'random_forest_classifier', label: 'Random Forest (Classification)' },
  { value: 'linear_regression', label: 'Linear Regression' },
  { value: 'logistic_regression', label: 'Logistic Regression' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.value?.toFixed(4)}</div>)}
    </div>
  );
};

export default function MLEngineering() {
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [algorithm, setAlgorithm] = useState('random_forest_regressor');
  const [columns, setColumns] = useState([]);
  const [training, setTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ds, md] = await Promise.all([api.getDatasets(), api.getModels()]);
      setDatasets(ds);
      setModels(md);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDatasetSelect(id) {
    setSelectedDataset(id);
    if (id) {
      try {
        const preview = await api.previewDataset(parseInt(id), 5);
        setColumns(preview.columns);
        setTargetColumn('');
      } catch (e) { console.error(e); }
    }
  }

  async function trainModel() {
    if (!selectedDataset || !targetColumn) return;
    setTraining(true);
    try {
      const result = await api.trainModel({
        dataset_id: parseInt(selectedDataset),
        target_column: targetColumn,
        algorithm,
      });
      setToast({ message: `Model trained — ${result.algorithm}`, type: 'success' });
      setSelectedModel(result);
      await loadData();
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
    setTraining(false);
    setTimeout(() => setToast(null), 4000);
  }

  async function viewModel(model) {
    try {
      const detail = await api.getModel(model.id);
      setSelectedModel(detail);
    } catch (e) { console.error(e); }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;

  // Feature importance chart data
  const importanceData = selectedModel?.metrics?.feature_importance
    ? Object.entries(selectedModel.metrics.feature_importance)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([k, v]) => ({ feature: k, importance: v }))
    : [];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">ML Engineering</h1>
        <p className="page-header__subtitle">Train models, evaluate performance, and generate predictions</p>
      </div>

      {/* Training Form */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div className="card__title">Train New Model</div>
        </div>
        <div className="grid-3" style={{ gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label">Dataset</label>
            <select className="form-select" value={selectedDataset} onChange={(e) => handleDatasetSelect(e.target.value)}>
              <option value="">Select a dataset</option>
              {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target Column</label>
            <select className="form-select" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} disabled={!columns.length}>
              <option value="">Select target</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Algorithm</label>
            <select className="form-select" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              {ALGORITHMS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
        </div>
        <button
          className="btn btn--primary btn--lg"
          onClick={trainModel}
          disabled={!selectedDataset || !targetColumn || training}
          style={{ marginTop: 'var(--space-md)', width: '100%' }}
        >
          {training ? <><div className="spinner" style={{ width: 18, height: 18 }}></div> Training...</> : '🚀 Train Model'}
        </button>
      </div>

      {/* Model Detail */}
      {selectedModel && (
        <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Metrics */}
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">{selectedModel.name}</div>
                <div className="card__subtitle">v{selectedModel.version}</div>
              </div>
              <span className="badge badge--purple">{selectedModel.algorithm}</span>
            </div>
            <div>
              {Object.entries(selectedModel.metrics || {})
                .filter(([k]) => k !== 'feature_importance' && k !== 'task')
                .map(([key, value]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{key.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      {typeof value === 'number' ? value.toFixed(4) : value}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Feature Importance */}
          {importanceData.length > 0 && (
            <div className="card">
              <div className="card__header">
                <div className="card__title">Feature Importance</div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Models */}
      {models.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Trained Models ({models.length})</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Version</th><th>Algorithm</th><th>Key Metric</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {models.map(m => {
                  const keyMetric = m.metrics?.accuracy ?? m.metrics?.r2;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td><span className="badge badge--info">v{m.version}</span></td>
                      <td>{m.algorithm}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{keyMetric?.toFixed(4) ?? '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</td>
                      <td><button className="btn btn--ghost btn--sm" onClick={() => viewModel(m)}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
