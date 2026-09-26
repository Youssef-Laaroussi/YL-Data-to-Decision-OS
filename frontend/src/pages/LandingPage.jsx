import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database, ShieldCheck, BarChart3, Brain, Target, RotateCcw, Bot,
  ArrowRight, CheckCircle2, Sparkles, Github, Zap,
  Play, ChevronRight, Layers, Code2,
  ArrowUpRight, Activity, UserPlus, LogIn
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

/* ─── Realistic SVG Illustrations ────────────────────────── */

function HeroIllustration() {
  return (
    <div className="lp-hero-illustration">
      <svg viewBox="0 0 400 300" fill="none" className="lp-hero-svg" xmlns="http://www.w3.org/2000/svg">
        {/* Dashboard mockup */}
        <rect x="20" y="15" width="360" height="270" rx="16" fill="#fff" stroke="#0d7377" strokeOpacity="0.12" strokeWidth="1.5"/>
        
        {/* Top bar */}
        <rect x="20" y="15" width="360" height="40" rx="16" fill="#0d7377" fillOpacity="0.04"/>
        <rect x="20" y="53" width="360" height="2" fill="#0d7377" fillOpacity="0.06"/>
        <circle cx="44" cy="35" r="5" fill="#ef4444" opacity="0.7"/>
        <circle cx="60" cy="35" r="5" fill="#f59e0b" opacity="0.7"/>
        <circle cx="76" cy="35" r="5" fill="#10b981" opacity="0.7"/>
        <rect x="140" y="29" width="120" height="12" rx="6" fill="#0d7377" fillOpacity="0.06"/>

        {/* Sidebar mini */}
        <rect x="20" y="55" width="80" height="230" fill="#0d7377" fillOpacity="0.03"/>
        <rect x="20" y="55" width="80" height="230" rx="0" fill="none" stroke="#0d7377" strokeOpacity="0.04"/>
        <rect x="32" y="70" width="56" height="8" rx="4" fill="#0d7377" fillOpacity="0.15"/>
        <rect x="32" y="88" width="48" height="6" rx="3" fill="#0d7377" fillOpacity="0.08"/>
        <rect x="32" y="102" width="52" height="6" rx="3" fill="#0d7377" fillOpacity="0.08"/>
        <rect x="32" y="116" width="40" height="6" rx="3" fill="#0d7377" fillOpacity="0.08"/>
        <rect x="32" y="130" width="56" height="6" rx="3" fill="#14b8a6" fillOpacity="0.2"/>
        <rect x="32" y="144" width="44" height="6" rx="3" fill="#0d7377" fillOpacity="0.08"/>

        {/* KPI Cards */}
        <rect x="115" y="68" width="78" height="52" rx="8" fill="#f0fdfa" stroke="#0d7377" strokeOpacity="0.1"/>
        <rect x="125" y="78" width="28" height="4" rx="2" fill="#0d7377" fillOpacity="0.15"/>
        <text x="125" y="102" fontSize="14" fontWeight="800" fill="#0d7377" fontFamily="Inter">2,847</text>

        <rect x="203" y="68" width="78" height="52" rx="8" fill="#f0fdfa" stroke="#0d7377" strokeOpacity="0.1"/>
        <rect x="213" y="78" width="32" height="4" rx="2" fill="#14b8a6" fillOpacity="0.2"/>
        <text x="213" y="102" fontSize="14" fontWeight="800" fill="#14b8a6" fontFamily="Inter">94.2%</text>

        <rect x="291" y="68" width="78" height="52" rx="8" fill="#f0fdfa" stroke="#0d7377" strokeOpacity="0.1"/>
        <rect x="301" y="78" width="24" height="4" rx="2" fill="#0d7377" fillOpacity="0.15"/>
        <text x="301" y="102" fontSize="14" fontWeight="800" fill="#0d7377" fontFamily="Inter">12</text>

        {/* Bar Chart */}
        <rect x="115" y="132" width="125" height="95" rx="8" fill="#fff" stroke="#0d7377" strokeOpacity="0.08"/>
        <rect x="125" y="140" width="40" height="4" rx="2" fill="#0d7377" fillOpacity="0.12"/>
        {/* Bars */}
        <rect x="130" y="195" width="12" height="22" rx="3" fill="#5eead4">
          <animate attributeName="height" from="0" to="22" dur="0.6s" fill="freeze"/>
          <animate attributeName="y" from="217" to="195" dur="0.6s" fill="freeze"/>
        </rect>
        <rect x="148" y="183" width="12" height="34" rx="3" fill="#14b8a6">
          <animate attributeName="height" from="0" to="34" dur="0.6s" begin="0.1s" fill="freeze"/>
          <animate attributeName="y" from="217" to="183" dur="0.6s" begin="0.1s" fill="freeze"/>
        </rect>
        <rect x="166" y="170" width="12" height="47" rx="3" fill="#0d7377">
          <animate attributeName="height" from="0" to="47" dur="0.6s" begin="0.2s" fill="freeze"/>
          <animate attributeName="y" from="217" to="170" dur="0.6s" begin="0.2s" fill="freeze"/>
        </rect>
        <rect x="184" y="178" width="12" height="39" rx="3" fill="#14b8a6">
          <animate attributeName="height" from="0" to="39" dur="0.6s" begin="0.3s" fill="freeze"/>
          <animate attributeName="y" from="217" to="178" dur="0.6s" begin="0.3s" fill="freeze"/>
        </rect>
        <rect x="202" y="160" width="12" height="57" rx="3" fill="#0d7377">
          <animate attributeName="height" from="0" to="57" dur="0.6s" begin="0.4s" fill="freeze"/>
          <animate attributeName="y" from="217" to="160" dur="0.6s" begin="0.4s" fill="freeze"/>
        </rect>

        {/* Pie Chart */}
        <rect x="250" y="132" width="119" height="95" rx="8" fill="#fff" stroke="#0d7377" strokeOpacity="0.08"/>
        <rect x="260" y="140" width="40" height="4" rx="2" fill="#0d7377" fillOpacity="0.12"/>
        <circle cx="310" cy="192" r="26" fill="#e0f7f5"/>
        <path d="M310 166 A26 26 0 0 1 336 192 L310 192 Z" fill="#0d7377"/>
        <path d="M336 192 A26 26 0 0 1 310 218 L310 192 Z" fill="#14b8a6"/>
        <path d="M310 218 A26 26 0 0 1 284 192 L310 192 Z" fill="#5eead4"/>
        <path d="M284 192 A26 26 0 0 1 310 166 L310 192 Z" fill="#99f6e4"/>
        <circle cx="310" cy="192" r="10" fill="#fff"/>

        {/* Line chart at bottom */}
        <rect x="115" y="238" width="254" height="40" rx="8" fill="#fff" stroke="#0d7377" strokeOpacity="0.08"/>
        <polyline
          points="130,268 155,258 180,262 205,252 230,256 255,248 280,244 305,250 330,238 355,242"
          stroke="#0d7377"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="300"
          strokeDashoffset="300"
        >
          <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.5s" begin="0.3s" fill="freeze"/>
        </polyline>
        <polyline
          points="130,270 155,265 180,268 205,260 230,263 255,258 280,255 305,258 330,250 355,253"
          stroke="#14b8a6"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
          strokeDasharray="300"
          strokeDashoffset="300"
        >
          <animate attributeName="stroke-dashoffset" from="300" to="0" dur="1.5s" begin="0.5s" fill="freeze"/>
        </polyline>
      </svg>
    </div>
  );
}

function DataVizIllustration() {
  return (
    <div className="lp-dataviz-illustration">
      <svg viewBox="0 0 360 260" fill="none" className="lp-dataviz-svg" xmlns="http://www.w3.org/2000/svg">
        {/* Main donut chart */}
        <circle cx="120" cy="130" r="80" fill="#f0fdfa"/>
        <circle cx="120" cy="130" r="72" fill="none" stroke="#e0f7f5" strokeWidth="24"/>
        <circle cx="120" cy="130" r="72" fill="none" stroke="#0d7377" strokeWidth="24" 
          strokeDasharray="140 313" strokeLinecap="round" transform="rotate(-90 120 130)">
          <animate attributeName="stroke-dasharray" from="0 453" to="140 313" dur="1s" fill="freeze"/>
        </circle>
        <circle cx="120" cy="130" r="72" fill="none" stroke="#14b8a6" strokeWidth="24"
          strokeDasharray="100 353" strokeDashoffset="-140" strokeLinecap="round" transform="rotate(-90 120 130)">
          <animate attributeName="stroke-dasharray" from="0 453" to="100 353" dur="1s" begin="0.3s" fill="freeze"/>
        </circle>
        <circle cx="120" cy="130" r="72" fill="none" stroke="#5eead4" strokeWidth="24"
          strokeDasharray="80 373" strokeDashoffset="-240" strokeLinecap="round" transform="rotate(-90 120 130)">
          <animate attributeName="stroke-dasharray" from="0 453" to="80 373" dur="1s" begin="0.5s" fill="freeze"/>
        </circle>
        <circle cx="120" cy="130" r="50" fill="#fff"/>
        <text x="105" y="126" fontSize="18" fontWeight="900" fill="#0d7377" fontFamily="Inter">94%</text>
        <text x="100" y="142" fontSize="8" fill="#5a6a7a" fontFamily="Inter" fontWeight="500">Quality Score</text>

        {/* Right side: mini stats cards */}
        <rect x="225" y="30" width="120" height="55" rx="10" fill="#fff" stroke="#0d7377" strokeOpacity="0.08"/>
        <rect x="237" y="42" width="8" height="8" rx="2" fill="#0d7377"/>
        <rect x="251" y="42" width="50" height="4" rx="2" fill="#0d7377" fillOpacity="0.12"/>
        <text x="237" y="72" fontSize="13" fontWeight="800" fill="#0d7377" fontFamily="Inter">+23.5%</text>
        <text x="280" y="72" fontSize="8" fill="#5a6a7a" fontFamily="Inter">growth</text>

        {/* Mini line chart card */}
        <rect x="225" y="100" width="120" height="55" rx="10" fill="#fff" stroke="#0d7377" strokeOpacity="0.08"/>
        <rect x="237" y="112" width="8" height="8" rx="2" fill="#14b8a6"/>
        <rect x="251" y="112" width="50" height="4" rx="2" fill="#14b8a6" fillOpacity="0.15"/>
        <polyline points="237,142 252,135 267,138 282,128 297,132 312,125 327,120" 
          stroke="#14b8a6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Mini bar chart card */}
        <rect x="225" y="170" width="120" height="55" rx="10" fill="#fff" stroke="#0d7377" strokeOpacity="0.08"/>
        <rect x="237" y="182" width="8" height="8" rx="2" fill="#5eead4"/>
        <rect x="251" y="182" width="50" height="4" rx="2" fill="#5eead4" fillOpacity="0.2"/>
        <rect x="240" y="207" width="10" height="12" rx="2" fill="#5eead4"/>
        <rect x="256" y="201" width="10" height="18" rx="2" fill="#14b8a6"/>
        <rect x="272" y="195" width="10" height="24" rx="2" fill="#0d7377"/>
        <rect x="288" y="199" width="10" height="20" rx="2" fill="#14b8a6"/>
        <rect x="304" y="193" width="10" height="26" rx="2" fill="#0d7377"/>
        <rect x="320" y="197" width="10" height="22" rx="2" fill="#5eead4"/>
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

          <div className="lp-nav__auth">
            <button
              onClick={() => navigate('/signin')}
              className="lp-nav__signin"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="lp-nav__cta"
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </button>
          </div>
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
                onClick={() => navigate('/signup')}
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
              onClick={() => navigate('/signup')}
              className="lp-btn lp-btn--white"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="lp-btn lp-btn--ghost"
            >
              <span>Sign In</span>
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
