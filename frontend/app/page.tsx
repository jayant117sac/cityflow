'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   '#2274A5',   // Rich Cerulean
  sand:      '#E7DFC6',   // Sand Dune
  alice:     '#E9F1F7',   // Alice Blue
  dark:      '#131B23',   // Ink Black
  darkCard:  '#1A2533',
  text:      '#131B23',
  muted:     '#5A6A7A',
  white:     '#FFFFFF',
  border:    '#D4CDB8',
  lightBorder:'#C8DCE9',
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const style = {
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  };
  return { ref, style };
}

function useCount(target: number, active: boolean, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [active, target, duration]);
  return val;
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, vis };
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(19,27,35,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? `1px solid rgba(34,116,165,0.2)` : 'none',
      transition: 'all 0.35s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.primary}, #1a5a82)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: `0 4px 12px ${T.primary}40` }}>🏙️</div>
          <div>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 20,
              color: T.white, letterSpacing: '-0.3px' }}>CityFlow</span>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5,
              textTransform: 'uppercase', lineHeight: 1 }}>Smart City Platform</div>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Impact', href: '#impact' },
            { label: 'Dashboard', href: '#dashboard' },
          ].map(l => (
            <a key={l.label} href={l.href} style={{
              color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', transition: 'color 0.2s', letterSpacing: '0.1px',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = T.white)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>{l.label}</a>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{
            color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500,
            textDecoration: 'none', padding: '9px 18px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            Sign In
          </Link>
          <Link href="/register" style={{
            color: T.white, fontSize: 14, fontWeight: 600,
            textDecoration: 'none', padding: '9px 20px', borderRadius: 8,
            background: T.primary, boxShadow: `0 4px 16px ${T.primary}50`,
            transition: 'all 0.2s', letterSpacing: '0.1px',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a5a82'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = T.primary; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Hero (Split Layout) ───────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const fade = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
  });

  return (
    <section style={{
      minHeight: '100vh', background: T.dark,
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden', paddingTop: 68,
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(${T.primary} 1px,transparent 1px),linear-gradient(90deg,${T.primary} 1px,transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Cerulean glow left */}
      <div style={{
        position: 'absolute', top: '10%', left: '-5%', width: 500, height: 500,
        borderRadius: '50%', background: `radial-gradient(circle,${T.primary}18 0%,transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      {/* Sand glow right */}
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%', width: 400, height: 400,
        borderRadius: '50%', background: `radial-gradient(circle,${T.sand}10 0%,transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', width: '100%' }}>

        {/* LEFT — Text */}
        <div>
          {/* Gov badge */}
          <div style={{
            ...fade(0),
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${T.primary}18`, border: `1px solid ${T.primary}35`,
            borderRadius: 6, padding: '6px 14px', marginBottom: 28,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF50',
              boxShadow: '0 0 6px #4CAF50', animation: 'cfBlink 2s ease-in-out infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600,
              letterSpacing: 0.8, textTransform: 'uppercase' }}>Live · 40+ City Departments</span>
          </div>

          {/* Headline */}
          <h1 style={{
            ...fade(0.1),
            fontFamily: 'Georgia, serif', fontSize: 'clamp(38px,4.5vw,60px)',
            fontWeight: 700, lineHeight: 1.1, color: T.white,
            marginBottom: 20, letterSpacing: '-1px',
          }}>
            The Digital Nervous<br />
            <span style={{
              background: `linear-gradient(90deg, ${T.alice}, ${T.primary})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>System of Your City</span>
          </h1>

          {/* Subtext */}
          <p style={{
            ...fade(0.2),
            fontSize: 17, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.75, marginBottom: 36, maxWidth: 480,
          }}>
            A unified platform connecting citizens and governments. Report issues, engage civically, and track real-time city data — all in one place.
          </p>

          {/* Trust line */}
          <div style={{ ...fade(0.25), display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
            <div style={{ display: 'flex' }}>
              {['👨‍💼','👩‍💼','👨','👩','🧑'].map((e, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%',
                  background: `hsl(${200 + i * 15},40%,35%)`,
                  border: `2px solid ${T.dark}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, marginLeft: i === 0 ? 0 : -8, zIndex: 5 - i }}>{e}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: '#F59E0B', fontSize: 12 }}>★</span>)}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Trusted by 12,000+ citizens</p>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ ...fade(0.3), display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              background: T.primary, color: T.white, fontWeight: 700,
              fontSize: 15, padding: '13px 28px', borderRadius: 8,
              textDecoration: 'none', boxShadow: `0 6px 24px ${T.primary}45`,
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 32px ${T.primary}55`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${T.primary}45`; }}>
              Get Started Free →
            </Link>
            <a href="#features" style={{
              color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: 15,
              padding: '13px 24px', borderRadius: 8, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${T.primary}50`; (e.currentTarget as HTMLElement).style.background = 'rgba(34,116,165,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
              ▶ Explore Platform
            </a>
          </div>
        </div>

        {/* RIGHT — Animated Dashboard */}
        <div style={{ ...fade(0.4), position: 'relative' }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: 28,
            background: `linear-gradient(135deg,${T.primary}12,${T.sand}08)`,
            filter: 'blur(20px)', zIndex: 0,
          }} />
          <div style={{
            position: 'relative', zIndex: 1,
            background: T.darkCard, borderRadius: 20,
            border: `1px solid rgba(34,116,165,0.2)`,
            padding: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Dashboard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', animation: 'cfBlink 2s infinite' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>Live City Dashboard</span>
              </div>
              <div style={{ background: `${T.primary}20`, border: `1px solid ${T.primary}30`,
                borderRadius: 20, padding: '4px 12px', fontSize: 11, color: T.alice, fontWeight: 600 }}>Pune, MH</div>
            </div>

            {/* KPI Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Civic Score', val: '742', icon: '🏆', color: T.primary },
                { label: 'Reports', val: '8', icon: '📋', color: '#4CAF50' },
                { label: 'Alerts', val: '3', icon: '🔔', color: '#F59E0B' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: `${T.dark}80`, borderRadius: 12, padding: '14px 12px',
                  border: `1px solid ${s.color}20`, textAlign: 'center',
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <p style={{ color: T.white, fontWeight: 800, fontSize: 22, fontFamily: 'Georgia,serif',
                    margin: '4px 0 2px', background: `linear-gradient(135deg,${T.white},${s.color})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 0.5 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ background: `${T.dark}60`, borderRadius: 12, padding: '14px 16px',
              border: `1px solid rgba(34,116,165,0.12)`, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Weekly Reports</span>
                <span style={{ color: T.primary, fontSize: 11, fontWeight: 600 }}>+18% vs last week</span>
              </div>
              <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 56 }}>
                {[28, 52, 38, 72, 50, 88, 64].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, borderRadius: '4px 4px 0 0',
                    background: i === 5 ? T.primary : `${T.primary}35`,
                    height: `${h}%`,
                    boxShadow: i === 5 ? `0 0 12px ${T.primary}60` : 'none',
                    transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', marginTop: 6 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <span key={i} style={{ flex: 1, textAlign: 'center',
                    color: i === 5 ? T.primary : 'rgba(255,255,255,0.2)', fontSize: 10 }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Recent issues */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { icon: '🛣️', title: 'Pothole — FC Road', status: 'In Progress', color: '#F59E0B' },
                { icon: '💡', title: 'Street Light — Deccan', status: 'Resolved', color: '#4CAF50' },
                { icon: '🗑️', title: 'Garbage — Baner', status: 'Pending', color: T.primary },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: `${T.dark}60`, borderRadius: 10, padding: '10px 14px',
                  border: `1px solid rgba(255,255,255,0.05)`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 500 }}>{item.title}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: item.color,
                    background: `${item.color}18`, padding: '3px 8px', borderRadius: 20 }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cfBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes cfFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </section>
  );
}

// ── Trust Bar ─────────────────────────────────────────────────────────────────
function TrustBar() {
  const { ref, style } = useFadeIn(0);
  return (
    <section style={{ background: T.sand, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '18px 0' }}>
      <div ref={ref} style={{ ...style, maxWidth: 1100, margin: '0 auto', padding: '0 40px',
        display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { icon: '🔐', label: 'Govt-Grade Security' },
          { icon: '📡', label: 'Real-Time Analytics' },
          { icon: '🏗️', label: 'Smart Infrastructure' },
          { icon: '🗳️', label: 'Civic Engagement' },
          { icon: '🤖', label: 'AI-Powered Routing' },
          { icon: '📱', label: 'Mobile First' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4A3F2F', letterSpacing: '0.2px' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const { ref, vis } = useInView();
  const features = [
    { icon: '🛣️', title: 'Smart Issue Reporting', desc: 'Geo-tagged photo reports for potholes, broken streetlights, and infrastructure failures. AI auto-routes to the correct city department within seconds.', color: T.primary, tag: 'Most Used' },
    { icon: '🗳️', title: 'Civic Engagement Hub', desc: 'Community voting on local proposals, budget decisions, and city planning initiatives. Your voice directly shapes municipal governance.', color: '#3A7D44', tag: 'New' },
    { icon: '📊', title: 'Real-Time City Insights', desc: 'Live traffic data, air quality index, weather alerts, and official city-wide announcements updated every 60 seconds.', color: '#7B5EA7', tag: 'Live Data' },
    { icon: '🅿️', title: 'Smart Parking System', desc: 'Real-time parking spot availability across all city zones. Reserve, navigate, and pay digitally without leaving the platform.', color: '#C67B2F', tag: 'Beta' },
  ];
  return (
    <section id="features" style={{ background: T.alice, padding: '96px 40px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: 60,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.65s ease',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: T.primary,
            textTransform: 'uppercase', marginBottom: 12 }}>Platform Features</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 700,
            color: T.text, letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 16 }}>
            Everything a Modern City Needs
          </h2>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
            A complete civic operating system that bridges the gap between citizens and government.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(255px,1fr))', gap: 22 }}>
          {features.map((f, i) => <FeatureCard key={i} {...f} delay={i * 0.1} vis={vis} />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, color, tag, delay, vis }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.white, borderRadius: 18, padding: 30,
        border: `1px solid ${hov ? color + '50' : T.lightBorder}`,
        boxShadow: hov ? `0 18px 48px ${color}18` : '0 2px 12px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        opacity: vis ? 1 : 0,
        transitionDelay: `${delay}s`,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: `${color}12`,
          border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
        <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}12`,
          padding: '4px 10px', borderRadius: 20, letterSpacing: 0.8, textTransform: 'uppercase' }}>{tag}</span>
      </div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 19, fontWeight: 700, color: T.text,
        marginBottom: 10, letterSpacing: '-0.2px' }}>{title}</h3>
      <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.72 }}>{desc}</p>
      <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color,
        opacity: hov ? 1 : 0, transition: 'opacity 0.25s', display: 'flex', alignItems: 'center', gap: 5 }}>
        Learn more <span style={{ transition: 'transform 0.2s', transform: hov ? 'translateX(3px)' : 'translateX(0)' }}>→</span>
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, vis } = useInView();
  const steps = [
    { num: '01', icon: '📱', title: 'Citizen Reports an Issue', desc: 'A citizen geo-tags a broken streetlight with a photo. The report is submitted in under 30 seconds from their phone.', color: T.primary },
    { num: '02', icon: '🤖', title: 'AI Categorizes & Routes', desc: 'Our system classifies the problem, assigns priority, and automatically routes it to the correct city department.', color: '#7B5EA7' },
    { num: '03', icon: '🏛️', title: 'Department Resolves It', desc: 'The department dispatches a team. The citizen receives real-time status updates until the issue is resolved.', color: '#3A7D44' },
  ];
  return (
    <section id="how-it-works" style={{ background: T.white, padding: '96px 40px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: 72,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.65s ease',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: T.primary,
            textTransform: 'uppercase', marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 700,
            color: T.text, letterSpacing: '-0.5px', marginBottom: 16 }}>From Report to Resolution</h2>
          <p style={{ color: T.muted, fontSize: 17, maxWidth: 460, margin: '0 auto' }}>
            A transparent three-step process that holds city departments accountable.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
          {/* Connector */}
          <div style={{
            position: 'absolute', top: 44, left: '20%', right: '20%', height: 2,
            background: `linear-gradient(90deg,${T.primary},#7B5EA7,#3A7D44)`,
            opacity: vis ? 0.3 : 0, transition: 'opacity 1s ease 0.5s',
          }} />

          {steps.map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '0 20px',
              opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(28px)',
              transition: `all 0.65s ease ${0.25 + i * 0.15}s`,
            }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
                  background: `${s.color}10`, border: `2px solid ${s.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                }}>{s.icon}</div>
                <div style={{
                  position: 'absolute', top: -4, right: -4, width: 26, height: 26,
                  borderRadius: '50%', background: s.color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: T.white,
                  boxShadow: `0 2px 8px ${s.color}50`,
                }}>{s.num}</div>
              </div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700,
                color: T.text, marginBottom: 12 }}>{s.title}</h3>
              <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.72 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Dashboard Preview ─────────────────────────────────────────────────────────
function DashboardPreview() {
  const { ref, vis } = useInView();
  return (
    <section id="dashboard" style={{ background: T.dark, padding: '96px 40px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 72, alignItems: 'center' }}>

        {/* Left */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(-28px)', transition: 'all 0.7s ease' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: T.primary,
            textTransform: 'uppercase', marginBottom: 16 }}>Citizen Dashboard</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 700,
            color: T.white, letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 20 }}>
            Your City,<br />At a Glance
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
            One dashboard to track your civic contributions, active issue reports, city alerts, and weekly engagement — all updated live.
          </p>
          {[
            { icon: '🏆', text: 'Track Civic Score & earn community rewards' },
            { icon: '📍', text: 'Follow your issue reports in real-time' },
            { icon: '🔔', text: 'Instant city-wide emergency notifications' },
            { icon: '📊', text: 'Weekly civic activity & impact summary' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
              opacity: vis ? 1 : 0, transition: `all 0.55s ease ${0.3 + i * 0.1}s`,
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8,
                background: `${T.primary}15`, border: `1px solid ${T.primary}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{item.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{item.text}</span>
            </div>
          ))}
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24,
            background: T.primary, color: T.white, fontWeight: 600, fontSize: 15,
            padding: '12px 26px', borderRadius: 8, textDecoration: 'none',
            boxShadow: `0 6px 22px ${T.primary}45`, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
            Open Your Dashboard →
          </Link>
        </div>

        {/* Right — Mock Dashboard */}
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(28px)', transition: 'all 0.7s ease 0.15s' }}>
          <div style={{
            background: T.darkCard, borderRadius: 20, padding: 22,
            border: `1px solid rgba(34,116,165,0.18)`,
            boxShadow: `0 32px 72px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,116,165,0.08)`,
          }}>
            {/* User bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg,${T.primary},#1a5a82)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
                <div>
                  <p style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Jayant Sangrame</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Active Citizen · Pune</p>
                </div>
              </div>
              <div style={{
                background: `linear-gradient(135deg,${T.primary},#1a5a82)`,
                borderRadius: 10, padding: '6px 12px', textAlign: 'center',
                boxShadow: `0 4px 12px ${T.primary}40`,
              }}>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}>Civic Score</p>
                <p style={{ color: T.white, fontWeight: 800, fontSize: 20, fontFamily: 'Georgia,serif' }}>742</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Reports', val: '8', icon: '📋', color: T.primary },
                { label: 'Resolved', val: '5', icon: '✅', color: '#4CAF50' },
                { label: 'Alerts', val: '3', icon: '🔔', color: '#F59E0B' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: `${T.dark}80`, borderRadius: 10, padding: '11px 8px',
                  border: `1px solid ${s.color}18`, textAlign: 'center',
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <p style={{ color: T.white, fontWeight: 700, fontSize: 18, margin: '3px 0 1px' }}>{s.val}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{ background: `${T.dark}70`, borderRadius: 10, padding: '12px 14px', marginBottom: 12,
              border: `1px solid rgba(34,116,165,0.1)` }}>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, letterSpacing: 1,
                textTransform: 'uppercase', marginBottom: 10 }}>Activity This Week</p>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 44 }}>
                {[25,55,40,75,50,88,60].map((h, i) => (
                  <div key={i} style={{
                    flex: 1, borderRadius: '3px 3px 0 0',
                    background: i === 5 ? T.primary : `${T.primary}30`,
                    height: `${h}%`,
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', marginTop: 5 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <span key={i} style={{ flex: 1, textAlign: 'center',
                    color: i === 5 ? T.primary : 'rgba(255,255,255,0.18)', fontSize: 9 }}>{d}</span>
                ))}
              </div>
            </div>

            {/* Alert */}
            <div style={{ background: `${T.primary}14`, border: `1px solid ${T.primary}28`,
              borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: T.white, fontSize: 12, fontWeight: 600 }}>Power Outage — Shivajinagar</p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>Est. restoration 2:00 PM today</p>
              </div>
              <span style={{ background: '#EF444420', color: '#EF4444', fontSize: 9,
                padding: '3px 7px', borderRadius: 20, fontWeight: 700, letterSpacing: 0.5 }}>HIGH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Impact Stats ──────────────────────────────────────────────────────────────
function ImpactStats() {
  const { ref, vis } = useInView();
  const stats = [
    { target: 12000, label: 'Active Citizens', icon: '👥', format: (v: number) => `${Math.floor(v / 1000)}k+` },
    { target: 350, label: 'Issues Resolved Weekly', icon: '🔧', format: (v: number) => `${v}+` },
    { target: 98, label: 'Satisfaction Rate', icon: '⭐', format: (v: number) => `${v}%` },
    { target: 40, label: 'Integrated Departments', icon: '🏛️', format: (v: number) => `${v}+` },
  ];
  return (
    <section id="impact" style={{ background: T.sand, padding: '96px 40px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: 60,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.65s ease',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, color: '#7A6030',
            textTransform: 'uppercase', marginBottom: 12 }}>City Impact</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(30px,4vw,46px)', fontWeight: 700,
            color: T.text, letterSpacing: '-0.5px', marginBottom: 14 }}>Real Results. Real Cities.</h2>
          <p style={{ color: '#7A6A50', fontSize: 17 }}>Measurable change driven by citizen participation.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {stats.map((s, i) => <StatCard key={i} {...s} active={vis} delay={i * 0.1} />)}
        </div>
      </div>
    </section>
  );
}

function StatCard({ target, label, icon, format, active, delay }: any) {
  const [hov, setHov] = useState(false);
  const val = useCount(target, active);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: T.white, borderRadius: 18, padding: '32px 24px', textAlign: 'center',
        border: `1px solid ${hov ? T.primary + '40' : T.border}`,
        boxShadow: hov ? `0 14px 40px ${T.primary}14` : '0 2px 10px rgba(0,0,0,0.05)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: `all 0.3s ease ${delay}s`,
      }}>
      <div style={{ fontSize: 34, marginBottom: 12 }}>{icon}</div>
      <div style={{
        fontFamily: 'Georgia,serif', fontSize: 44, fontWeight: 800, lineHeight: 1,
        background: `linear-gradient(135deg,${T.primary},#1a5a82)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>{format(val)}</div>
      <p style={{ color: T.muted, fontSize: 14, marginTop: 8, fontWeight: 500 }}>{label}</p>
    </div>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  const { ref, style } = useFadeIn(0);
  return (
    <section style={{ background: T.dark, padding: '96px 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 700, height: 700, borderRadius: '50%',
        background: `radial-gradient(circle,${T.primary}10 0%,transparent 65%)`, pointerEvents: 'none',
      }} />
      {/* Sand accent lines */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,transparent,${T.sand}20,transparent)` }} />
      <div ref={ref} style={{ ...style, maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `${T.primary}20`,
          border: `1px solid ${T.primary}35`, margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏙️</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(30px,4vw,50px)', fontWeight: 700,
          color: T.white, letterSpacing: '-0.5px', lineHeight: 1.12, marginBottom: 18 }}>
          Build the Future of<br />
          <span style={{ background: `linear-gradient(90deg,${T.alice},${T.primary})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Urban Living</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, marginBottom: 38, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 38px' }}>
          Join thousands of citizens already making their cities smarter, safer, and more responsive to their needs.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            background: T.primary, color: T.white, fontWeight: 700, fontSize: 15,
            padding: '14px 34px', borderRadius: 8, textDecoration: 'none',
            boxShadow: `0 8px 28px ${T.primary}50`, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.background = '#1a5a82'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.background = T.primary; }}>
            Start Using CityFlow
          </Link>
          <a href="mailto:demo@cityflow.gov" style={{
            color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontSize: 15,
            padding: '14px 34px', borderRadius: 8, textDecoration: 'none',
            border: `1px solid rgba(255,255,255,0.12)`, background: 'rgba(255,255,255,0.03)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${T.primary}50`; (e.currentTarget as HTMLElement).style.background = `${T.primary}10`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
            Request Government Demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = {
    Platform: ['Citizen Dashboard','Issue Reporting','Smart Parking','City Alerts','Civic Score'],
    Company:  ['About CityFlow','Careers','Press','Blog','Contact'],
    Legal:    ['Privacy Policy','Terms of Service','Security','Documentation','API'],
  };
  return (
    <footer style={{ background: '#0C1219', borderTop: `1px solid rgba(34,116,165,0.12)`, padding: '60px 40px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9,
                background: `linear-gradient(135deg,${T.primary},#1a5a82)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏙️</div>
              <span style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 18, color: T.white }}>CityFlow</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, lineHeight: 1.8, maxWidth: 260 }}>
              A Digital Nervous System For Cities. Connecting citizens and governments for smarter, more accountable urban governance.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              {['𝕏', 'in', 'gh'].map((s, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: 7,
                  background: `${T.primary}12`, border: `1px solid ${T.primary}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.3)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${T.primary}25`; (e.currentTarget as HTMLElement).style.color = T.alice; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${T.primary}12`; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}>{s}</div>
              ))}
            </div>
          </div>
          {Object.entries(cols).map(([cat, items]) => (
            <div key={cat}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700,
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{cat}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13,
                    textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = T.alice)}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid rgba(34,116,165,0.1)`, paddingTop: 22,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>© 2026 CityFlow. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4CAF50', animation: 'cfBlink 2s infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>All systems operational</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <ImpactStats />
      <CTA />
      <Footer />
    </>
  );
}