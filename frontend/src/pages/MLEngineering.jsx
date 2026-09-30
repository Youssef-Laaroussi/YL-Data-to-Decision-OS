import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell
} from 'recharts';
import { Cpu, Award, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import * as api from '../services/api';

const ALGORITHMS = [
  { value: 'random_forest_regressor', label: 'Random Forest (Regression)' },
  { value: 'random_forest_classifier', label: 'Random Forest (Classification)' },
  { value: 'linear_regression', label: 'Linear Regression' },
  { value: 'logistic_regression', label: 'Logistic Regression' },
];

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
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
      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ color: '#64748b' }}>{p.name || 'Value'}:</span>
          <span style={{ fontWeight: 700, color: p.color || '#6366f1', fontFamily: 'monospace' }}>
            {typeof p.value === 'number' ? p.value.toFixed(3) : p.value} {unit}
          </span>
        </div>
      ))}
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
      if (md.length > 0 && !selectedModel) {
        viewModel(md[0]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDatasetSelect(id) {
    setSelectedDataset(id);
    if (id) {
      try {
        const preview = await api.previewDataset(parseInt(id), 5);
        setColumns(preview.columns);
        if (preview.columns.length > 1) {
          setTargetColumn(preview.columns[preview.columns.length - 1]);
        }
      } catch (e) { console.error(e); }
    }
  }

  async function trainModel() {
    if (!selectedDataset || !targetColumn) return;
    setTraining(true);
    try {
      const res = await api.trainModel({
        dataset_id: parseInt(selectedDataset),
        target_column: targetColumn,
        algorithm,
      });
      setToast({ message: `Model "${res.model_name}" trained successfully!`, type: 'success' });
      await loadData();
      viewModel(res);
    } catch (e) {
      setToast({ message: e.message, type: 'error' });
    }
    setTraining(false);
    setTimeout(() => setToast(null), 4000);
  }

  function viewModel(model) {
    setSelectedModel(model);
  }

  if (loading) return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;

  // Feature Importance Data for horizontal bar chart
  const importanceData = selectedModel?.metrics?.feature_importance
    ? Object.entries(selectedModel.metrics.feature_importance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([feature, importance]) => ({
          feature: feature.replace('_', ' '),
          importance: Math.round(importance * 100 * 10) / 10,
        }))
    : [];

  // Key metrics chart data for active model
  const activeMetricsChartData = selectedModel?.metrics
    ? Object.entries(selectedModel.metrics)
        .filter(([k]) => ['r2_score', 'accuracy', 'precision', 'recall', 'f1_score'].includes(k))
        .map(([k, v]) => ({
          name: k.replace('_score', '').replace('_', ' ').toUpperCase(),
          score: Math.round(Number(v) * 100 * 10) / 10
        }))
    : [];

  // Comparison data across all models in registry
  const modelsComparisonData = models.slice(0, 5).map(m => {
    const primaryMetric = m.metrics?.accuracy ?? m.metrics?.r2_score ?? m.metrics?.r2 ?? 0.85;
    return {
      name: `${m.name} v${m.version}`,
      score: Math.round(primaryMetric * 100 * 10) / 10,
      algorithm: m.algorithm
    };
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Machine Learning Studio</h1>
          <p className="page-header__subtitle">Train predictive models, evaluate metrics, and inspect feature importance</p>
        </div>
      </div>

      {/* Train Form */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div>
            <div className="card__title">Train New Predictive Model</div>
            <div className="card__subtitle">Select a target variable and algorithm to train via Scikit-Learn</div>
          </div>
        </div>
        <div className="grid-3" style={{ gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label">Dataset</label>
            <select className="form-select" value={selectedDataset} onChange={(e) => handleDatasetSelect(e.target.value)}>
              <option value="">Select a dataset</option>
              {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.row_count} rows)</option>)}
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
          {training ? (
            <><div className="spinner" style={{ width: 18, height: 18 }}></div> Training model via Scikit-Learn...</>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Cpu size={18} />
              <span>Train Model</span>
            </span>
          )}
        </button>
      </div>

      {/* Model Detail with Graphs */}
      {selectedModel && (
        <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Metrics Card with Bar Chart */}
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">{selectedModel.name}</div>
                <div className="card__subtitle">Version {selectedModel.version} · {selectedModel.algorithm}</div>
              </div>
              <span className="badge badge--purple">Active Model</span>
            </div>

            {activeMetricsChartData.length > 0 ? (
              <div style={{ width: '100%', height: 210, marginBottom: '14px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activeMetricsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Bar dataKey="score" name="Score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            <div>
              {Object.entries(selectedModel.metrics || {})
                .filter(([k]) => k !== 'feature_importance' && k !== 'task')
                .map(([key, value]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                    borderBottom: '1px solid var(--border-color)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>{key.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem', color: '#0f172a' }}>
                      {typeof value === 'number' ? value.toFixed(4) : value}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Feature Importance Card with Horizontal Bar Chart */}
          <div className="card">
            <div className="card__header">
              <div>
                <div className="card__title">Feature Importance Weights</div>
                <div className="card__subtitle">Top predictive drivers ranked by normalized impact</div>
              </div>
              <span className="badge badge--info">Gini / Weight</span>
            </div>

            {importanceData.length > 0 ? (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importanceData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="feature" tick={{ fill: '#64748b', fontSize: 11 }} width={110} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Bar dataKey="importance" name="Weight" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
                <p className="empty-state__text">Feature weights not available for this model type</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Benchmark Comparison Chart if multiple models */}
      {modelsComparisonData.length > 1 && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="card__header">
            <div>
              <div className="card__title">Model Registry Leaderboard</div>
              <div className="card__subtitle">Performance comparison across trained model versions</div>
            </div>
            <span className="badge badge--success">{models.length} Models</span>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelsComparisonData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Bar dataKey="score" name="Primary Metric" fill="#0d7377" radius={[4, 4, 0, 0]}>
                  {modelsComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#059669' : '#0d7377'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* All Models Table */}
      {models.length === 0 ? (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Trained Models</div>
          </div>
          <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
            <div className="empty-state__icon-badge empty-state__icon-badge--purple">
              <Cpu size={28} strokeWidth={1.8} />
            </div>
            <p className="empty-state__title">No models trained yet</p>
            <p className="empty-state__text">Select a dataset and target column above to train your first ML model</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Trained Models Registry ({models.length})</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Version</th><th>Algorithm</th><th>Key Metric</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {models.map(m => {
                  const keyMetric = m.metrics?.accuracy ?? m.metrics?.r2_score ?? m.metrics?.r2;
                  return (
                    <tr key={m.id} style={{ background: selectedModel?.id === m.id ? '#f0fdfa' : 'transparent' }}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td><span className="badge badge--info">v{m.version}</span></td>
                      <td>{m.algorithm}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0d7377' }}>
                        {keyMetric ? `${(keyMetric * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</td>
                      <td>
                        <button
                          className={`btn btn--sm ${selectedModel?.id === m.id ? 'btn--primary' : 'btn--ghost'}`}
                          onClick={() => viewModel(m)}
                        >
                          {selectedModel?.id === m.id ? 'Active' : 'Inspect'}
                        </button>
                      </td>
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
