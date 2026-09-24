import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Database, ShieldCheck, BarChart3,
  Brain, GitBranch, Target, RotateCcw, Bot, Upload, Activity
} from 'lucide-react';

const navItems = [
  { section: 'Overview' },
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
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
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">🚀</div>
        <div>
          <div className="sidebar__logo-text">D2D OS</div>
          <div className="sidebar__logo-badge">Open Source</div>
        </div>
      </div>

      <nav className="sidebar__nav">
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
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon className="sidebar__link-icon" size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '0 16px', marginTop: 'auto' }}>
        <div className="card" style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '4px' }}>
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
