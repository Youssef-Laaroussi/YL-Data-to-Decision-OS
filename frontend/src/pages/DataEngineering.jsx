import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Play, Eye, RefreshCw } from 'lucide-react';
import * as api from '../services/api';

export default function DataEngineering() {
  const [datasets, setDatasets] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [ds, pl] = await Promise.all([api.getDatasets(), api.getPipelines()]);
      setDatasets(ds);
      setPipelines(pl);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await api.uploadDataset(file);
      showToast(`Dataset "${result.name}" uploaded — ${result.rows} rows, ${result.columns} columns`, 'success');
      await loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
    setUploading(false);
  }

  async function handleETL(datasetId) {
    try {
      const result = await api.runETL(datasetId);
      showToast(`ETL pipeline ${result.status} — ${result.steps?.length ?? 0} steps`, 'success');
      await loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  async function handlePreview(datasetId) {
    try {
      const data = await api.previewDataset(datasetId);
      setPreview(data);
    } catch (e) {
      showToast(e.message, 'error');
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
      handleUpload(file);
    } else {
      showToast('Only CSV and JSON files are supported', 'error');
    }
  }, []);

  if (loading) {
    return <div className="loading-overlay"><div className="spinner spinner--lg"></div></div>;
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-header__title">Data Engineering</h1>
        <p className="page-header__subtitle">Ingest, transform, and manage your data pipelines</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragging ? 'upload-zone--active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        style={{ marginBottom: 'var(--space-2xl)' }}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv,.json"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files[0])}
        />
        {uploading ? (
          <>
            <div className="spinner spinner--lg" style={{ margin: '0 auto var(--space-md)' }}></div>
            <p className="upload-zone__text">Processing file...</p>
          </>
        ) : (
          <>
            <div className="upload-zone__icon">📂</div>
            <p className="upload-zone__text">
              <strong>Drop your file here</strong> or click to browse
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
              Supports CSV and JSON files
            </p>
          </>
        )}
      </div>

      {/* Datasets Table */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="card__header">
          <div className="card__title">Datasets ({datasets.length})</div>
          <button className="btn btn--ghost btn--sm" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {datasets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📊</div>
            <p className="empty-state__title">No datasets yet</p>
            <p className="empty-state__text">Upload a CSV or JSON file to get started</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Rows</th>
                  <th>Columns</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td><span className="badge badge--info">{d.source_type}</span></td>
                    <td>{d.row_count?.toLocaleString()}</td>
                    <td>{d.column_count}</td>
                    <td>{(d.size_bytes / 1024).toFixed(1)} KB</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => handlePreview(d.id)}>
                          <Eye size={14} /> Preview
                        </button>
                        <button className="btn btn--primary btn--sm" onClick={() => handleETL(d.id)}>
                          <Play size={14} /> Run ETL
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Preview Modal */}
      {preview && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="card__header">
            <div className="card__title">Data Preview ({preview.shape.rows} rows × {preview.shape.columns} cols)</div>
            <button className="btn btn--ghost btn--sm" onClick={() => setPreview(null)}>Close</button>
          </div>
          <div className="data-table-wrapper" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {preview.columns.map(col => (
                    <th key={col}>
                      {col}
                      <div style={{ fontSize: '0.6rem', fontWeight: 400, opacity: 0.7 }}>{preview.dtypes[col]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.data.slice(0, 15).map((row, i) => (
                  <tr key={i}>
                    {preview.columns.map(col => (
                      <td key={col} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span style={{ color: 'var(--accent-red)', opacity: 0.6 }}>null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pipelines */}
      {pipelines.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Pipeline Runs</div>
          </div>
          {pipelines.map((p) => (
            <div key={p.id} className="agent-log__entry agent-log__entry--completed" style={{ marginBottom: '8px' }}>
              <div className="agent-log__step">{p.name}</div>
              <div className="agent-log__details">
                <span className={`badge badge--${p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'info'}`}>
                  {p.status}
                </span>
                <span style={{ marginLeft: '8px' }}>{p.steps?.length ?? 0} steps</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
