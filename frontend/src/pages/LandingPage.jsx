import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database, ShieldCheck, BarChart3, Brain, Target, RotateCcw, Bot,
  ArrowRight, CheckCircle2, Sparkles, Github, Zap,
  Play, ChevronRight, TrendingUp, Layers, Shield, Code2,
  ArrowUpRight, Activity, PieChart, LineChart
} from 'lucide-react';

/* ─── Data ───────────────────────────────────────────────── */

const MODULES = [
  {
    icon: Database,
    title: 'Data Engineering',
    desc: 'Automated ETL pipelines with schema inference, profiling, and streaming ingestion.',
    link: '/data',
    color: 'teal'
  },
  {
    icon: ShieldCheck,
    title: 'Data Quality',
    desc: 'Enforce data contracts, detect anomalies, and gate bad data before it propagates.',
    link: '/quality',
    color: 'emerald'
  },
  {
    icon: BarChart3,
    title: 'Analytics & BI',
    desc: 'Interactive distributions, correlation matrices, and real-time KPI tracking.',
    link: '/analytics',
    color: 'sky'
  },
  {
    icon: Brain,
    title: 'ML Engineering',
    desc: 'Train models, evaluate metrics, track feature importance, and manage artifacts.',
    link: '/ml',
    color: 'indigo'
  },
  {
    icon: Target,
    title: 'Decision Engine',
    desc: 'Transform predictions into actionable business decisions with ROI estimates.',
    link: '/decisions',
    color: 'amber'
  },
  {
    icon: RotateCcw,
    title: 'Feedback Loop',
    desc: 'Close the loop: measure outcomes, detect drift, and trigger automated retraining.',
    link: '/feedback',
    color: 'rose'
  }
];

const STATS = [
  { value: '6', label: 'Pipeline Modules', icon: Layers },
  { value: '100%', label: 'Automated Profiling', icon: Activity },
  { value: '<30s', label: 'Quality Gate Check', icon: Zap },
  { value: 'MIT', label: 'Open Source License', icon: Code2 }
];

const TECH_STACK = [
  { name: 'FastAPI', role: 'Backend API' },
  { name: 'React 18', role: 'Frontend UI' },
  { name: 'PostgreSQL', role: 'Production DB' },
  { name: 'scikit-learn', role: 'ML Framework' },
  { name: 'SQLAlchemy', role: 'ORM Layer' },
  { name: 'Recharts', role: 'Visualization' }
];

/* ─── Animated Counter ───────────────────────────────────── */

function AnimatedValue({ value }) {
  const [display, setDisplay] = useState(value);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const num = parseInt(value);
    if (isNaN(num)) { setDisplay(value); return; }
    let current = 0;
    const step = Math.ceil(num / 30);
    const interval = setInterval(() => {
      current += step;
      if (current >= num) { setDisplay(String(num)); clearInterval(interval); }
      else setDisplay(String(current));
    }, 40);
    return () => clearInterval(interval);
  }, [visible, value]);

  return <span ref={ref}>{display}</span>;
}

/* ─── Inline SVG Illustrations ───────────────────────────── */

function HeroIllustration() {
  return (
    <div className="lp-hero-illustration">
      {/* Bar chart */}
      <svg viewBox="0 0 320 220" fill="none" className="lp-hero-svg">
        {/* Background card */}
        <rect x="10" y="10" width="300" height="200" rx="16" fill="#0d7377" opacity="0.07" />
        {/* Grid lines */}
        <line x1="50" y1="40" x2="50" y2="180" stroke="#0d7377" strokeOpacity="0.1" />
        <line x1="50" y1="180" x2="280" y2="180" stroke="#0d7377" strokeOpacity="0.1" />
        <line x1="50" y1="140" x2="280" y2="140" stroke="#0d7377" strokeOpacity="0.05" strokeDasharray="4" />
        <line x1="50" y1="100" x2="280" y2="100" stroke="#0d7377" strokeOpacity="0.05" strokeDasharray="4" />
        <line x1="50" y1="60" x2="280" y2="60" stroke="#0d7377" strokeOpacity="0.05" strokeDasharray="4" />
        {/* Bars */}
        <rect x="70" y="120" width="24" height="60" rx="4" fill="#0d7377" opacity="0.6">
          <animate attributeName="height" from="0" to="60" dur="0.8s" fill="freeze" />
          <animate attributeName="y" from="180" to="120" dur="0.8s" fill="freeze" />
        </rect>
        <rect x="110" y="80" width="24" height="100" rx="4" fill="#0d7377" opacity="0.8">
          <animate attributeName="height" from="0" to="100" dur="0.8s" begin="0.1s" fill="freeze" />
          <animate attributeName="y" from="180" to="80" dur="0.8s" begin="0.1s" fill="freeze" />
        </rect>
        <rect x="150" y="60" width="24" height="120" rx="4" fill="#0d7377">
          <animate attributeName="height" from="0" to="120" dur="0.8s" begin="0.2s" fill="freeze" />
          <animate attributeName="y" from="180" to="60" dur="0.8s" begin="0.2s" fill="freeze" />
        </rect>
        <rect x="190" y="100" width="24" height="80" rx="4" fill="#14b8a6" opacity="0.7">
          <animate attributeName="height" from="0" to="80" dur="0.8s" begin="0.3s" fill="freeze" />
          <animate attributeName="y" from="180" to="100" dur="0.8s" begin="0.3s" fill="freeze" />
        </rect>
        <rect x="230" y="50" width="24" height="130" rx="4" fill="#0d7377" opacity="0.9">
          <animate attributeName="height" from="0" to="130" dur="0.8s" begin="0.4s" fill="freeze" />
          <animate attributeName="y" from="180" to="50" dur="0.8s" begin="0.4s" fill="freeze" />
        </rect>
        {/* Trend line */}
        <polyline
          points="82,115 122,75 162,55 202,95 242,45"
          stroke="#14b8a6"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          strokeDashoffset="300"
        >
          <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.2s" begin="0.5s" fill="freeze" />
        </polyline>
        {/* Dots on trend line */}
        {[
          [82, 115], [122, 75], [162, 55], [202, 95], [242, 45]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#14b8a6" stroke="#fff" strokeWidth="2" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${0.8 + i * 0.1}s`} fill="freeze" />
          </circle>
        ))}
      </svg>
    </div>
  );
}

function DataVizIllustration() {
  return (
    <div className="lp-dataviz-illustration">
      <svg viewBox="0 0 300 220" fill="none" className="lp-dataviz-svg">
        {/* Pie chart */}
        <circle cx="100" cy="110" r="70" fill="#e0f7f5" />
        <path d="M100 40 A70 70 0 0 1 170 110 L100 110 Z" fill="#0d7377" />
        <path d="M170 110 A70 70 0 0 1 100 180 L100 110 Z" fill="#14b8a6" />
        <path d="M100 180 A70 70 0 0 1 30 110 L100 110 Z" fill="#5eead4" />
        <path d="M30 110 A70 70 0 0 1 100 40 L100 110 Z" fill="#99f6e4" />
        <circle cx="100" cy="110" r="30" fill="#ffffff" />
        {/* Mini line chart */}
        <rect x="190" y="30" width="100" height="70" rx="10" fill="#ffffff" stroke="#0d7377" strokeOpacity="0.15" />
        <polyline points="200,80 215,60 230,70 245,45 260,55 275,40" stroke="#0d7377" strokeWidth="2" fill="none" strokeLinecap="round" />
        <text x="200" y="50" fontSize="8" fill="#0d7377" fontWeight="600" fontFamily="Inter">Trends</text>
        {/* Mini bar chart */}
        <rect x="190" y="120" width="100" height="70" rx="10" fill="#ffffff" stroke="#0d7377" strokeOpacity="0.15" />
        <rect x="200" y="165" width="12" height="15" rx="2" fill="#5eead4" />
        <rect x="218" y="155" width="12" height="25" rx="2" fill="#14b8a6" />
        <rect x="236" y="145" width="12" height="35" rx="2" fill="#0d7377" />
        <rect x="254" y="150" width="12" height="30" rx="2" fill="#14b8a6" />
        <rect x="272" y="140" width="12" height="40" rx="2" fill="#0d7377" />
        <text x="200" y="140" fontSize="8" fill="#0d7377" fontWeight="600" fontFamily="Inter">Volume</text>
      </svg>
    </div>
  );
}

/* ─── Landing Page Component ─────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp">

      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="lp-nav__inner">
          <Link to="/" className="lp-nav__brand">
            <div className="lp-nav__brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="lp-nav__brand-name">
              <span className="lp-nav__brand-yl">YL</span> Data-to-Decision OS
            </span>
          </Link>

          <nav className="lp-nav__links">
            <a href="#modules" className="lp-nav__link">Modules</a>
            <a href="#architecture" className="lp-nav__link">Architecture</a>
            <a
              href="https://github.com/Youssef-Laaroussi/YL-Data-to-Decision-OS"
              target="_blank"
              rel="noreferrer"
              className="lp-nav__link"
            >
              <Github size={15} />
              <span>GitHub</span>
            </a>
          </nav>

          <button
            onClick={() => navigate('/dashboard')}
            className="lp-nav__cta"
          >
            <span>Dashboard</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="lp-hero">
        {/* Decorative blobs */}
        <div className="lp-blob lp-blob--1" />
        <div className="lp-blob lp-blob--2" />
        <div className="lp-blob lp-blob--3" />

        <div className="lp-hero__grid">
          <div className="lp-hero__content">
            <div className="lp-hero__badge">
              <Sparkles size={13} />
              <span>Open Source Data Platform</span>
            </div>

            <h1 className="lp-hero__title">
              Actionable Decisions,{' '}
              <span className="lp-hero__title-accent">Measured Results</span>
            </h1>

            <p className="lp-hero__desc">
              Transform raw data into traceable, measurable decisions with built-in
              feedback loops. From ingestion to ROI — all in one unified system.
            </p>

            <div className="lp-hero__actions">
              <button
                onClick={() => navigate('/dashboard')}
                className="lp-btn lp-btn--primary"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/pipeline')}
                className="lp-btn lp-btn--secondary"
              >
                <Play size={16} />
                <span>See Pipeline</span>
              </button>
            </div>

            <div className="lp-hero__trust">
              {['MIT Licensed', 'FastAPI + React', 'PostgreSQL Ready', 'Closed-Loop ROI'].map((item) => (
                <div key={item} className="lp-trust-item">
                  <CheckCircle2 size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-hero__visual">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ─── Stats Section ──────────────────────────────────── */}
      <section className="lp-stats">
        <div className="lp-stats__grid">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="lp-stat-card">
                <div className="lp-stat-card__icon">
                  <Icon size={20} />
                </div>
                <div className="lp-stat-card__value">
                  <AnimatedValue value={stat.value} />
                </div>
                <div className="lp-stat-card__label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Feature Showcase ───────────────────────────────── */}
      <section className="lp-showcase">
        <div className="lp-blob lp-blob--4" />
        <div className="lp-showcase__grid">
          <div className="lp-showcase__visual">
            <DataVizIllustration />
          </div>
          <div className="lp-showcase__content">
            <div className="lp-showcase__badge">
              <Activity size={13} />
              <span>Autonomous System</span>
            </div>
            <h2 className="lp-showcase__title">
              Elegant data,<br />
              <span className="lp-hero__title-accent">Measured Results</span>
            </h2>
            <p className="lp-showcase__desc">
              Our autonomous pipeline orchestrator coordinates all six stages — from data
              ingestion through quality gates, predictive modeling, prescriptive decisions,
              and continuous feedback tracking.
            </p>
            <button
              onClick={() => navigate('/pipeline')}
              className="lp-btn lp-btn--outline"
            >
              <span>Learn more</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Modules Grid ───────────────────────────────────── */}
      <section id="modules" className="lp-modules">
        <div className="lp-section-header">
          <div className="lp-section-header__badge">
            <Layers size={13} />
            <span>Pipeline Modules</span>
          </div>
          <h2 className="lp-section-header__title">
            Everything You Need for<br />Decision Intelligence
          </h2>
          <p className="lp-section-header__desc">
            Six integrated modules that form a closed-loop decision system. Each operates independently but works together seamlessly.
          </p>
        </div>

        <div className="lp-modules__grid">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.title} className={`lp-module-card lp-module-card--${mod.color}`}>
                <div className="lp-module-card__icon">
                  <Icon size={22} />
                </div>
                <h3 className="lp-module-card__title">{mod.title}</h3>
                <p className="lp-module-card__desc">{mod.desc}</p>
                <Link to={mod.link} className="lp-module-card__link">
                  <span>Explore</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Architecture ───────────────────────────────────── */}
      <section id="architecture" className="lp-arch">
        <div className="lp-blob lp-blob--5" />
        <div className="lp-section-header">
          <div className="lp-section-header__badge">
            <Code2 size={13} />
            <span>System Blueprint</span>
          </div>
          <h2 className="lp-section-header__title">
            Clean & Modular Architecture
          </h2>
          <p className="lp-section-header__desc">
            Every module is an independent service with its own domain logic, models, and schemas.
          </p>
        </div>

        <div className="lp-arch__diagram">
          <div className="lp-arch__layer">
            <div className="lp-arch__layer-label">Presentation</div>
            <div className="lp-arch__boxes">
              <div className="lp-arch__box lp-arch__box--highlight">React 18 + Vite</div>
              <div className="lp-arch__box">Recharts BI</div>
              <div className="lp-arch__box">Agentic Console</div>
            </div>
          </div>

          <div className="lp-arch__arrow">
            <ArrowRight size={16} />
            <span>REST API (FastAPI)</span>
          </div>

          <div className="lp-arch__layer">
            <div className="lp-arch__layer-label">Domain Modules</div>
            <div className="lp-arch__boxes lp-arch__boxes--grid">
              <div className="lp-arch__box">Data Engineering</div>
              <div className="lp-arch__box">Data Quality</div>
              <div className="lp-arch__box">Analytics</div>
              <div className="lp-arch__box">ML Studio</div>
              <div className="lp-arch__box">Decision Engine</div>
              <div className="lp-arch__box">Feedback Loop</div>
            </div>
          </div>

          <div className="lp-arch__arrow">
            <ArrowRight size={16} />
            <span>SQLAlchemy ORM</span>
          </div>

          <div className="lp-arch__layer">
            <div className="lp-arch__layer-label">Storage</div>
            <div className="lp-arch__boxes">
              <div className="lp-arch__box">PostgreSQL 15+</div>
              <div className="lp-arch__box">SQLite (Dev)</div>
              <div className="lp-arch__box">Artifacts (.joblib)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─────────────────────────────────────── */}
      <section className="lp-tech">
        <div className="lp-tech__label">Built With Industry-Standard Technologies</div>
        <div className="lp-tech__grid">
          {TECH_STACK.map((tech, i) => (
            <div key={i} className="lp-tech__badge">
              <span className="lp-tech__name">{tech.name}</span>
              <span className="lp-tech__role">{tech.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-cta__card">
          <h2 className="lp-cta__title">Ready to test the full workflow?</h2>
          <p className="lp-cta__desc">
            Launch the platform right now. Zero setup with automatic SQLite fallback and demo data.
          </p>
          <div className="lp-cta__actions">
            <button
              onClick={() => navigate('/dashboard')}
              className="lp-btn lp-btn--white"
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/data')}
              className="lp-btn lp-btn--ghost"
            >
              <span>Upload Dataset</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-nav__brand" style={{ marginBottom: '12px' }}>
              <div className="lp-nav__brand-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="lp-nav__brand-name">
                <span className="lp-nav__brand-yl">YL</span> Data-to-Decision OS
              </span>
            </Link>
            <p className="lp-footer__desc">
              An open-source operating system bridging data science, ML, and business decisions.
            </p>
          </div>

          <div className="lp-footer__cols">
            <div className="lp-footer__col">
              <h4>Platform</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/pipeline">Pipeline Agent</Link>
              <Link to="/data">Data Engineering</Link>
              <Link to="/quality">Data Quality</Link>
            </div>
            <div className="lp-footer__col">
              <h4>Intelligence</h4>
              <Link to="/analytics">Analytics & BI</Link>
              <Link to="/ml">ML Engineering</Link>
              <Link to="/decisions">Decisions</Link>
              <Link to="/feedback">Feedback Loop</Link>
            </div>
            <div className="lp-footer__col">
              <h4>Open Source</h4>
              <a href="https://github.com/Youssef-Laaroussi/YL-Data-to-Decision-OS" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://github.com/Youssef-Laaroussi/YL-Data-to-Decision-OS" target="_blank" rel="noreferrer">Contributing</a>
              <a href="https://github.com/Youssef-Laaroussi/YL-Data-to-Decision-OS/blob/main/LICENSE" target="_blank" rel="noreferrer">License (MIT)</a>
            </div>
          </div>
        </div>
        <div className="lp-footer__bottom">
          © {new Date().getFullYear()} YL Data-to-Decision OS Contributors. Licensed under MIT.
        </div>
      </footer>
    </div>
  );
}
