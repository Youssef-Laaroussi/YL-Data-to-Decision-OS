import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import DataEngineering from './pages/DataEngineering';
import DataQuality from './pages/DataQuality';
import Analytics from './pages/Analytics';
import MLEngineering from './pages/MLEngineering';
import Decisions from './pages/Decisions';
import FeedbackLoop from './pages/FeedbackLoop';
import PipelineAgent from './pages/PipelineAgent';

const PUBLIC_PATHS = ['/', '/signin', '/signup'];

function AppContent() {
  const location = useLocation();
  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  if (location.pathname === '/') return <LandingPage />;
  if (location.pathname === '/signin') return <SignIn />;
  if (location.pathname === '/signup') return <SignUp />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
