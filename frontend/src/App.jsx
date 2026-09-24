import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataEngineering from './pages/DataEngineering';
import DataQuality from './pages/DataQuality';
import Analytics from './pages/Analytics';
import MLEngineering from './pages/MLEngineering';
import Decisions from './pages/Decisions';
import FeedbackLoop from './pages/FeedbackLoop';
import PipelineAgent from './pages/PipelineAgent';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<PipelineAgent />} />
            <Route path="/data" element={<DataEngineering />} />
            <Route path="/quality" element={<DataQuality />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ml" element={<MLEngineering />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/feedback" element={<FeedbackLoop />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
