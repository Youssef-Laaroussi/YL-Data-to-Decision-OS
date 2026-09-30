import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Database, ShieldCheck, BarChart3,
  Brain, Target, RotateCcw, Bot, Home, Sparkles, Check, Menu, X
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
    <>
      {/* ─── Mobile Header (Visible only on screens < 768px) ─── */}
      <div className="mobile-header">
        <Link to="/" className="mobile-header__brand">
          <img src="/logo.jpg" alt="YL Data-to-Decision OS" className="app-logo" style={{ height: '36px', width: 'auto' }} />
          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            <span style={{ color: '#0d7377' }}>YL</span> D2D OS
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-header__toggle"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ─── Backdrop overlay on mobile ─── */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'sidebar-backdrop--active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ─── Sidebar Drawer ─── */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '12px' }}>
          <Link to="/" className="sidebar__logo" onClick={() => setMobileOpen(false)}>
            <img
              src="/logo.jpg"
              alt="YL Data-to-Decision OS"
              className="app-logo"
            />
            <div>
              <div className="sidebar__logo-text">
                <span style={{ color: '#0d7377', fontWeight: 800 }}>YL</span> D2D OS
              </div>
              <div className="sidebar__logo-badge">Open Source</div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="sidebar__close-btn"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

      <nav className="sidebar__nav">
        <Link
          to="/"
          className="sidebar__link"
          style={{ marginBottom: '6px', color: 'var(--accent-primary)', background: '#f0fdfa' }}
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
            background: seeded ? '#f0fdfa' : '#f0fdfa',
            color: 'var(--accent-primary)',
            borderColor: 'rgba(13, 115, 119, 0.15)',
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

        <div className="card card--no-hover" style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            YL Data-to-Decision OS
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            v0.1.0 · MIT License
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
