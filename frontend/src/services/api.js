/**
 * Data-to-Decision OS — API Service
 * Centralized API client for all backend calls.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  // Remove Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ─── Dashboard ──────────────────────────────────────────
export const getDashboardOverview = () => request('/dashboard/overview');

// ─── Data Engineering ───────────────────────────────────
export const uploadDataset = (file) => {
  const form = new FormData();
  form.append('file', file);
  return request('/data/upload', { method: 'POST', body: form });
};

export const getDatasets = () => request('/data/datasets');
export const getDataset = (id) => request(`/data/datasets/${id}`);
export const previewDataset = (id, rows = 20) => request(`/data/datasets/${id}/preview?rows=${rows}`);
export const runETL = (datasetId) => request(`/data/datasets/${datasetId}/etl`, { method: 'POST' });
export const getPipelines = (datasetId) => request(`/data/pipelines${datasetId ? `?dataset_id=${datasetId}` : ''}`);

// ─── Data Quality ───────────────────────────────────────
export const runQualityCheck = (datasetId) => request(`/quality/check/${datasetId}`, { method: 'POST' });
export const getQualityReports = (datasetId) => request(`/quality/reports${datasetId ? `?dataset_id=${datasetId}` : ''}`);

// ─── Analytics ──────────────────────────────────────────
export const runAnalysis = (datasetId) => request(`/analytics/analyze/${datasetId}`, { method: 'POST' });
export const getAnalyticsSnapshots = (datasetId) => request(`/analytics/snapshots/${datasetId}`);

// ─── ML Engineering ─────────────────────────────────────
export const trainModel = (params) => request('/ml/train', { method: 'POST', body: JSON.stringify(params) });
export const predict = (params) => request('/ml/predict', { method: 'POST', body: JSON.stringify(params) });
export const getModels = () => request('/ml/models');
export const getModel = (id) => request(`/ml/models/${id}`);

// ─── Decision Engine ────────────────────────────────────
export const generateDecision = (params) => request('/decisions/generate', { method: 'POST', body: JSON.stringify(params) });
export const approveDecision = (id) => request(`/decisions/${id}/approve`, { method: 'POST' });
export const executeDecision = (id) => request(`/decisions/${id}/execute`, { method: 'POST' });
export const getDecisions = (status) => request(`/decisions${status ? `?status=${status}` : ''}`);

// ─── Feedback Loop ──────────────────────────────────────
export const recordFeedback = (params) => request('/feedback/record', { method: 'POST', body: JSON.stringify(params) });
export const getFeedbackStats = () => request('/feedback/stats');
export const getAllFeedback = () => request('/feedback');

// ─── Agentic AI ─────────────────────────────────────────
export const runAgentPipeline = (params) => request('/agent/run', { method: 'POST', body: JSON.stringify(params) });
export const getAgentRuns = () => request('/agent/runs');
export const getAgentRun = (id) => request(`/agent/runs/${id}`);
