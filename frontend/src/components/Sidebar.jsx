import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Database, ShieldCheck, BarChart3,
  Brain, Target, RotateCcw, Bot, Home, Sparkles, Check
} from 'lucide-react';
import * as api from '../services/api';

const navItems = [
  { section: 'Overview' },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pipeline', label: 'Pipeline Agent', icon: Bot },
  { section: 'Data Layer' },
  { path: '/data', label: 'Data Engineering', icon: Database },
  { path: '/quality', label: 'Data Quality', icon: ShieldCheck },
  { path: '/analytics', label: 'Analytics & BI', icon: BarChart3 },
  { section: 'Intelligence' },
  { path: '/ml', label: 'ML Engineering', icon: Brain },
  { path: '/decisions', label: 'Decision Engine', icon: Target },
  { path: '/feedback', label: 'Feedback Loop', icon: RotateCcw },
];

export default function Sidebar() {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  async function handleSeedDemo() {
    setSeeding(true);
    try {
      if (api.seedDemoData) {
        await api.seedDemoData();
      }
      setSeeded(true);
      setTimeout(() => {
        setSeeded(false);
        window.location.reload();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  }

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Bot size={22} style={{ color: '#fff' }} />
        </div>
        <div>
          <div className="sidebar__logo-text">D2D OS</div>
          <div className="sidebar__logo-badge">Open Source</div>
        </div>
      </Link>

      <nav className="sidebar__nav">
        <Link
          to="/"
          className="sidebar__link"
          style={{ marginBottom: '6px', color: 'var(--accent-primary)', background: '#eff6ff' }}
        >
          <Home size={18} />
          <span>← Back to Website</span>
        </Link>

        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={`section-${i}`} className="sidebar__section-title">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon className="sidebar__link-icon" size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '0 16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleSeedDemo}
          disabled={seeding || seeded}
          className="btn btn--sm"
          style={{
            width: '100%',
            background: seeded ? '#eff6ff' : '#eff6ff',
            color: 'var(--accent-primary)',
            borderColor: '#bfdbfe',
            fontWeight: 600,
          }}
        >
          {seeded ? (
            <>
              <Check size={14} />
              <span>Data Ready!</span>
            </>
          ) : seeding ? (
            <span>Seeding Demo...</span>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Seed Demo Data</span>
            </>
          )}
        </button>

        <div className="card" style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            Data-to-Decision OS
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            v0.1.0 · MIT License
          </div>
        </div>
      </div>
    </aside>
  );
}
