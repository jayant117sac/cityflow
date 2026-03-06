'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const T = {
  primary:  '#AA4465',
  accent:   '#93E1D8',
  light:    '#DDFFF7',
  blush:    '#FFA69E',
  dark:     '#1A0A10',
  text:     '#0D1B2E',
  muted:    '#64748B',
  bg:       '#F9F5F6',
};

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function useCount(target: number, active: boolean, duration = 1800) {
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

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100,
      background: scrolled ? 'rgba(26,10,16,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(170,68,101,0.15)' : 'none',
      transition:'all 0.3s ease', padding:'0 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${T.primary},${T.accent})`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏙️</div>
          <span style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:20, color:'#fff', letterSpacing:'-0.3px' }}>CityFlow</span>
        </div>
        <div style={{ display:'flex', gap:32, alignItems:'center' }}>
          {['Features','How It Works','Impact','Dashboard'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              style={{ color:'rgba(255,255,255,0.65)', fontSize:14, fontWeight:500, textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.65)')}>{l}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link href="/login" style={{ color:'rgba(255,255,255,0.8)', fontSize:14, fontWeight:500,
            textDecoration:'none', padding:'8px 16px', borderRadius:8,
            border:'1px solid rgba(255,255,255,0.15)', transition:'all 0.2s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='transparent'; }}>Login</Link>
          <Link href="/register" style={{ color:'#fff', fontSize:14, fontWeight:600,
            textDecoration:'none', padding:'8px 18px', borderRadius:8,
            background:`linear-gradient(135deg,${T.primary},#8a3352)`,
            boxShadow:`0 4px 14px ${T.primary}60`, transition:'all 0.2s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  const pulses = [
    { top:'20%', left:'12%', size:6, color:T.primary, delay:0 },
    { top:'40%', left:'82%', size:8, color:T.accent, delay:0.5 },
    { top:'68%', left:'22%', size:5, color:T.blush, delay:1 },
    { top:'28%', left:'62%', size:7, color:T.primary, delay:1.5 },
    { top:'58%', left:'72%', size:5, color:T.accent, delay:0.8 },
    { top:'78%', left:'52%', size:6, color:T.blush, delay:1.2 },
  ];
  return (
    <section style={{ minHeight:'100vh', background:`linear-gradient(160deg,#0f0508 0%,${T.dark} 50%,#130810 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', paddingTop:64 }}>
      <div style={{ position:'absolute', inset:0, opacity:0.04,
        backgroundImage:'linear-gradient(rgba(221,255,247,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(221,255,247,0.5) 1px,transparent 1px)',
        backgroundSize:'60px 60px' }}/>
      <div style={{ position:'absolute', top:'15%', left:'8%', width:420, height:420, borderRadius:'50%',
        background:`radial-gradient(circle,${T.primary}20 0%,transparent 70%)`, filter:'blur(40px)' }}/>
      <div style={{ position:'absolute', bottom:'15%', right:'8%', width:360, height:360, borderRadius:'50%',
        background:`radial-gradient(circle,${T.accent}18 0%,transparent 70%)`, filter:'blur(40px)' }}/>
      <div style={{ position:'absolute', top:'55%', left:'45%', width:300, height:300, borderRadius:'50%',
        background:`radial-gradient(circle,${T.blush}12 0%,transparent 70%)`, filter:'blur(50px)' }}/>
      {pulses.map((p,i) => (
        <div key={i} style={{ position:'absolute', top:p.top, left:p.left }}>
          <div style={{ width:p.size, height:p.size, borderRadius:'50%', background:p.color,
            animation:`cfPulse ${2+i*0.3}s ease-in-out infinite`, animationDelay:`${p.delay}s`,
            boxShadow:`0 0 ${p.size*3}px ${p.color}` }}/>
        </div>
      ))}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:`${T.primary}18`,
          border:`1px solid ${T.primary}40`, borderRadius:100, padding:'6px 16px', marginBottom:32,
          opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:'all 0.6s ease' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:T.accent, animation:'cfPulse 2s infinite' }}/>
          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:13, fontWeight:500 }}>Now live in 40+ city departments</span>
        </div>
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(42px,6vw,80px)', fontWeight:700,
          lineHeight:1.08, color:'#fff', marginBottom:24, letterSpacing:'-1.5px',
          opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.7s ease 0.1s' }}>
          The Digital Nervous<br/>
          <span style={{ background:`linear-gradient(135deg,${T.blush},${T.primary},${T.accent})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>System of Your City</span>
        </h1>
        <p style={{ fontSize:'clamp(16px,2vw,20px)', color:'rgba(255,255,255,0.5)', maxWidth:600,
          margin:'0 auto 40px', lineHeight:1.7,
          opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.7s ease 0.2s' }}>
          A unified platform connecting citizens and governments for smarter, more responsive cities.
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap',
          opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(30px)', transition:'all 0.7s ease 0.3s' }}>
          <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:8,
            background:`linear-gradient(135deg,${T.primary},#8a3352)`, color:'#fff', fontWeight:600,
            fontSize:16, padding:'14px 32px', borderRadius:12, textDecoration:'none',
            boxShadow:`0 8px 30px ${T.primary}50`, transition:'all 0.2s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}>
            Get Started Free →
          </Link>
          <a href="#features" style={{ display:'inline-flex', alignItems:'center', gap:8,
            color:'rgba(255,255,255,0.8)', fontWeight:500, fontSize:16, padding:'14px 32px', borderRadius:12,
            textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.04)', transition:'all 0.2s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; }}>
            Explore Platform
          </a>
        </div>
        <div style={{ marginTop:80, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(40px)', transition:'all 0.9s ease 0.5s' }}>
          <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.primary}25`,
            borderRadius:20, padding:24, backdropFilter:'blur(10px)', boxShadow:`0 40px 80px rgba(0,0,0,0.5)` }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
              {[
                { label:'Active Citizens', val:'12,847', icon:'👥', color:T.primary },
                { label:'Issues Resolved', val:'3,241', icon:'✅', color:T.accent },
                { label:'Response Time', val:'2.4h', icon:'⚡', color:T.blush },
                { label:'Civic Score Avg', val:'742', icon:'🏆', color:T.light },
              ].map((s,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 16px', border:`1px solid ${s.color}20` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <span style={{ fontSize:18 }}>{s.icon}</span>
                    <span style={{ fontSize:10, color:s.color, background:`${s.color}22`, padding:'2px 6px', borderRadius:4, fontWeight:600 }}>LIVE</span>
                  </div>
                  <div style={{ fontSize:22, fontWeight:700, color:'#fff', fontFamily:'Georgia,serif' }}>{s.val}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:60, padding:'0 4px' }}>
              {[35,55,42,70,58,85,62,90,74,88,65,95].map((h,i) => (
                <div key={i} style={{ flex:1, background:`linear-gradient(to top,${T.primary},${T.accent})`,
                  height:`${h}%`, borderRadius:'4px 4px 0 0', opacity:0.6+(i/12)*0.4 }}/>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes cfPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.6)}}`}</style>
    </section>
  );
}

function TrustBadges() {
  const { ref, vis } = useInView();
  const badges = [
    { icon:'🔐', label:'Government Grade Security' },
    { icon:'📡', label:'Real-Time City Analytics' },
    { icon:'🏗️', label:'Smart Infrastructure Integration' },
    { icon:'🗳️', label:'Citizen Engagement Tools' },
    { icon:'🤖', label:'AI-Powered Categorization' },
    { icon:'📱', label:'Mobile-First Platform' },
  ];
  return (
    <section style={{ background:'#fff', borderBottom:'1px solid #EDE8EA', padding:'22px 0' }}>
      <div ref={ref} style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px',
        display:'flex', gap:32, justifyContent:'center', flexWrap:'wrap',
        opacity:vis?1:0, transition:'opacity 0.8s ease' }}>
        {badges.map((b,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8,
            opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(10px)',
            transition:`all 0.5s ease ${i*0.08}s` }}>
            <span style={{ fontSize:18 }}>{b.icon}</span>
            <span style={{ fontSize:13, fontWeight:600, color:T.muted }}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const { ref, vis } = useInView();
  const features = [
    { icon:'🛣️', title:'Smart Issue Reporting', desc:'Report potholes, broken streetlights, or infrastructure problems with geo-tagged photos. AI auto-categorizes and routes to the right department instantly.', color:T.primary, tag:'Most Used' },
    { icon:'🗳️', title:'Civic Engagement', desc:'Community voting on local proposals, budget decisions, and city planning. Your voice directly influences city governance in real time.', color:'#6B7FD4', tag:'New' },
    { icon:'📊', title:'Real-Time City Insights', desc:'Live traffic conditions, air quality index, weather alerts, and city-wide announcements. Stay informed about everything happening in your city.', color:T.accent, tag:'Live' },
    { icon:'🅿️', title:'Smart Parking', desc:'Real-time parking availability across all city zones. Reserve spots, get directions, and pay digitally — all from one unified platform.', color:T.blush, tag:'Beta' },
  ];
  return (
    <section id="features" style={{ background:T.bg, padding:'100px 24px' }}>
      <div ref={ref} style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:64,
          opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(24px)', transition:'all 0.6s ease' }}>
          <div style={{ display:'inline-block', background:`${T.primary}15`, color:T.primary,
            fontSize:12, fontWeight:700, letterSpacing:2, padding:'6px 14px', borderRadius:100,
            marginBottom:16, textTransform:'uppercase' }}>Platform Features</div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(32px,4vw,48px)', fontWeight:700,
            color:T.text, letterSpacing:'-0.5px', lineHeight:1.15, marginBottom:16 }}>Everything Your City Needs</h2>
          <p style={{ color:T.muted, fontSize:18, maxWidth:500, margin:'0 auto', lineHeight:1.6 }}>
            A complete civic operating system built for modern cities and engaged citizens.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:24 }}>
          {features.map((f,i) => <FeatureCard key={i} {...f} delay={i*0.1} vis={vis}/>)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, color, tag, delay, vis }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'#fff', borderRadius:20, padding:32,
        border:`1px solid ${hov?color+'40':'#E8E0E4'}`,
        boxShadow:hov?`0 20px 50px ${color}20`:'0 2px 10px rgba(0,0,0,0.05)',
        transform:hov?'translateY(-6px)':'translateY(0)', transition:'all 0.3s ease',
        opacity:vis?1:0, transitionDelay:`${delay}s` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ width:52, height:52, borderRadius:14, background:`${color}15`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{icon}</div>
        <span style={{ fontSize:11, fontWeight:700, color, background:`${color}15`,
          padding:'4px 10px', borderRadius:100, letterSpacing:0.5 }}>{tag}</span>
      </div>
      <h3 style={{ fontFamily:'Georgia,serif', fontSize:20, fontWeight:700, color:T.text, marginBottom:10 }}>{title}</h3>
      <p style={{ color:T.muted, fontSize:14, lineHeight:1.7 }}>{desc}</p>
      <div style={{ marginTop:20, display:'flex', alignItems:'center', gap:6, color, fontSize:13, fontWeight:600, opacity:hov?1:0, transition:'opacity 0.2s' }}>
        Learn more <span>→</span>
      </div>
    </div>
  );
}

function HowItWorks() {
  const { ref, vis } = useInView();
  const steps = [
    { num:'01', icon:'📱', title:'Citizen Reports', desc:'A citizen spots a broken streetlight and submits a geo-tagged report with a photo in under 30 seconds.', color:T.primary },
    { num:'02', icon:'🤖', title:'AI Categorizes', desc:'Our AI engine instantly categorizes the issue, assigns priority, and routes it to the right department.', color:'#6B7FD4' },
    { num:'03', icon:'🏛️', title:'City Resolves', desc:'The department receives the task, dispatches a team, and updates the citizen with real-time status notifications.', color:T.accent },
  ];
  return (
    <section id="how-it-works" style={{ background:'#fff', padding:'100px 24px' }}>
      <div ref={ref} style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:72,
          opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(24px)', transition:'all 0.6s ease' }}>
          <div style={{ display:'inline-block', background:`${T.accent}20`, color:'#2a9d8f',
            fontSize:12, fontWeight:700, letterSpacing:2, padding:'6px 14px', borderRadius:100,
            marginBottom:16, textTransform:'uppercase' }}>How It Works</div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(32px,4vw,48px)', fontWeight:700,
            color:T.text, letterSpacing:'-0.5px', marginBottom:16 }}>From Report to Resolution</h2>
          <p style={{ color:T.muted, fontSize:18, maxWidth:480, margin:'0 auto' }}>Three simple steps that transform civic problem-solving.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, position:'relative' }}>
          <div style={{ position:'absolute', top:52, left:'17%', right:'17%', height:2,
            background:`linear-gradient(90deg,${T.primary},#6B7FD4,${T.accent})`,
            opacity:vis?0.35:0, transition:'opacity 0.8s ease 0.4s' }}/>
          {steps.map((s,i) => (
            <div key={i} style={{ textAlign:'center', padding:'0 24px',
              opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(30px)',
              transition:`all 0.6s ease ${0.2+i*0.15}s` }}>
              <div style={{ position:'relative', display:'inline-block', marginBottom:24 }}>
                <div style={{ width:80, height:80, borderRadius:'50%', margin:'0 auto',
                  background:`linear-gradient(135deg,${s.color}20,${s.color}40)`,
                  border:`2px solid ${s.color}50`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>{s.icon}</div>
                <div style={{ position:'absolute', top:-6, right:-6, width:24, height:24, borderRadius:'50%',
                  background:s.color, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:10, fontWeight:800, color:'#fff' }}>{s.num}</div>
              </div>
              <h3 style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:700, color:T.text, marginBottom:12 }}>{s.title}</h3>
              <p style={{ color:T.muted, fontSize:15, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const { ref, vis } = useInView();
  return (
    <section id="dashboard" style={{ background:`linear-gradient(160deg,${T.dark},#130810)`, padding:'100px 24px', overflow:'hidden' }}>
      <div ref={ref} style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:64, alignItems:'center' }}>
          <div style={{ opacity:vis?1:0, transform:vis?'translateX(0)':'translateX(-30px)', transition:'all 0.7s ease' }}>
            <div style={{ display:'inline-block', background:`${T.primary}20`, color:T.blush,
              fontSize:12, fontWeight:700, letterSpacing:2, padding:'6px 14px', borderRadius:100,
              marginBottom:20, textTransform:'uppercase' }}>Citizen Dashboard</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(28px,3.5vw,44px)', fontWeight:700,
              color:'#fff', letterSpacing:'-0.5px', lineHeight:1.15, marginBottom:20 }}>
              Your City,<br/>At a Glance
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:16, lineHeight:1.8, marginBottom:32 }}>
              Track your civic score, monitor active reports, receive city alerts, and engage with your community — all from one beautiful dashboard.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { icon:'🏆', text:'Track your Civic Score and earn rewards' },
                { icon:'📍', text:'Monitor all your reported issues live' },
                { icon:'🔔', text:'Receive instant city-wide alert notifications' },
                { icon:'📊', text:'View weekly activity and impact metrics' },
              ].map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                  opacity:vis?1:0, transition:`all 0.5s ease ${0.3+i*0.1}s` }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.05)',
                    border:`1px solid ${T.primary}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>{item.icon}</div>
                  <span style={{ color:'rgba(255,255,255,0.6)', fontSize:14 }}>{item.text}</span>
                </div>
              ))}
            </div>
            <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:32,
              background:`linear-gradient(135deg,${T.primary},#8a3352)`, color:'#fff', fontWeight:600,
              fontSize:15, padding:'13px 28px', borderRadius:12, textDecoration:'none',
              boxShadow:`0 8px 24px ${T.primary}40` }}>
              Access Your Dashboard →
            </Link>
          </div>
          <div style={{ opacity:vis?1:0, transform:vis?'translateX(0)':'translateX(30px)', transition:'all 0.7s ease 0.2s' }}>
            <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${T.primary}25`,
              borderRadius:20, padding:24, backdropFilter:'blur(10px)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>Good morning,</p>
                  <p style={{ color:'#fff', fontWeight:700, fontSize:16 }}>Jayant Sangrame</p>
                </div>
                <div style={{ background:`linear-gradient(135deg,${T.primary},#8a3352)`, borderRadius:12, padding:'8px 14px', textAlign:'center' }}>
                  <p style={{ color:'rgba(255,255,255,0.7)', fontSize:10 }}>Civic Score</p>
                  <p style={{ color:'#fff', fontWeight:800, fontSize:22 }}>742</p>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
                {[
                  { label:'Reports', val:8, icon:'📋', color:T.primary },
                  { label:'Resolved', val:5, icon:'✅', color:T.accent },
                  { label:'Alerts', val:3, icon:'🔔', color:T.blush },
                ].map((s,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:12,
                    border:`1px solid ${s.color}20`, textAlign:'center' }}>
                    <span style={{ fontSize:20 }}>{s.icon}</span>
                    <p style={{ color:'#fff', fontWeight:700, fontSize:20, margin:'4px 0 2px' }}>{s.val}</p>
                    <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:12, padding:16,
                border:`1px solid ${T.primary}15`, marginBottom:14 }}>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:12 }}>Weekly Activity</p>
                <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:50 }}>
                  {[30,60,45,80,55,90,70].map((h,i) => (
                    <div key={i} style={{ flex:1, background:`linear-gradient(to top,${T.primary},${T.accent})`,
                      height:`${h}%`, borderRadius:'3px 3px 0 0', opacity:0.8 }}/>
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                  {['M','T','W','T','F','S','S'].map((d,i) => (
                    <span key={i} style={{ color:'rgba(255,255,255,0.2)', fontSize:10, flex:1, textAlign:'center' }}>{d}</span>
                  ))}
                </div>
              </div>
              <div style={{ background:`${T.primary}18`, border:`1px solid ${T.primary}30`,
                borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>⚡</span>
                <div>
                  <p style={{ color:'#fff', fontSize:13, fontWeight:600 }}>Power Outage — Shivajinagar</p>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11 }}>Estimated restoration: 2:00 PM</p>
                </div>
                <span style={{ marginLeft:'auto', background:`${T.primary}30`, color:T.blush,
                  fontSize:10, padding:'3px 8px', borderRadius:100, fontWeight:700 }}>HIGH</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactStats() {
  const { ref, vis } = useInView();
  const stats = [
    { target:12000, label:'Active Citizens', icon:'👥', format:(v:number)=>`${Math.floor(v/1000)}k+` },
    { target:350, label:'Issues Resolved Weekly', icon:'🔧', format:(v:number)=>`${v}+` },
    { target:98, label:'Response Satisfaction', icon:'⭐', format:(v:number)=>`${v}%` },
    { target:40, label:'Integrated Departments', icon:'🏛️', format:(v:number)=>`${v}+` },
  ];
  return (
    <section id="impact" style={{ background:T.bg, padding:'100px 24px' }}>
      <div ref={ref} style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:64, opacity:vis?1:0, transition:'all 0.6s ease' }}>
          <div style={{ display:'inline-block', background:`${T.blush}30`, color:'#c45c6a',
            fontSize:12, fontWeight:700, letterSpacing:2, padding:'6px 14px', borderRadius:100,
            marginBottom:16, textTransform:'uppercase' }}>City Impact</div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(32px,4vw,48px)', fontWeight:700,
            color:T.text, letterSpacing:'-0.5px', marginBottom:16 }}>Real Results, Real Cities</h2>
          <p style={{ color:T.muted, fontSize:18 }}>Numbers that prove CityFlow is changing urban governance.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24 }}>
          {stats.map((s,i) => <StatCard key={i} {...s} active={vis} delay={i*0.1}/>)}
        </div>
      </div>
    </section>
  );
}

function StatCard({ target, label, icon, format, active, delay }: any) {
  const [hov, setHov] = useState(false);
  const val = useCount(target, active);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'#fff', borderRadius:20, padding:32, textAlign:'center',
        border:`1px solid ${hov?T.primary+'30':'#E8E0E4'}`,
        boxShadow:hov?`0 16px 40px ${T.primary}15`:'0 2px 8px rgba(0,0,0,0.04)',
        transform:hov?'translateY(-4px)':'translateY(0)', transition:`all 0.3s ease ${delay}s` }}>
      <div style={{ fontSize:36, marginBottom:12 }}>{icon}</div>
      <div style={{ fontFamily:'Georgia,serif', fontSize:42, fontWeight:800,
        background:`linear-gradient(135deg,${T.primary},${T.accent})`,
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>{format(val)}</div>
      <p style={{ color:T.muted, fontSize:14, marginTop:8, fontWeight:500 }}>{label}</p>
    </div>
  );
}

function CTA() {
  const { ref, vis } = useInView();
  return (
    <section style={{ background:`linear-gradient(135deg,${T.dark},#130810)`, padding:'100px 24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:600, height:600, borderRadius:'50%',
        background:`radial-gradient(circle,${T.primary}15 0%,transparent 70%)`, pointerEvents:'none' }}/>
      <div ref={ref} style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative',
        opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(24px)', transition:'all 0.7s ease' }}>
        <div style={{ fontSize:48, marginBottom:20 }}>🚀</div>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(32px,4vw,52px)', fontWeight:700,
          color:'#fff', letterSpacing:'-0.5px', lineHeight:1.1, marginBottom:20 }}>
          Build the Future of<br/>
          <span style={{ background:`linear-gradient(135deg,${T.blush},${T.primary},${T.accent})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Urban Living</span>
        </h2>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:18, marginBottom:40, lineHeight:1.7 }}>
          Join thousands of citizens already making their cities smarter, safer, and more responsive.
        </p>
        <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/register" style={{ background:`linear-gradient(135deg,${T.primary},#8a3352)`, color:'#fff',
            fontWeight:700, fontSize:16, padding:'15px 36px', borderRadius:12, textDecoration:'none',
            boxShadow:`0 8px 30px ${T.primary}50`, transition:'all 0.2s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}>
            Start Using CityFlow
          </Link>
          <a href="mailto:demo@cityflow.gov" style={{ color:'rgba(255,255,255,0.7)', fontWeight:500, fontSize:16,
            padding:'15px 36px', borderRadius:12, textDecoration:'none',
            border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.04)', transition:'all 0.2s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=`${T.primary}60`; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.15)'; }}>
            Request Government Demo
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const links = {
    Platform: ['Citizen Dashboard','Issue Reporting','Smart Parking','City Alerts','Civic Score'],
    Company: ['About CityFlow','Careers','Press','Blog','Contact'],
    Legal: ['Privacy Policy','Terms of Service','Security','Documentation','API Reference'],
  };
  return (
    <footer style={{ background:'#080308', borderTop:`1px solid ${T.primary}15`, padding:'64px 24px 32px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, marginBottom:48 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:`linear-gradient(135deg,${T.primary},${T.accent})`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏙️</div>
              <span style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:20, color:'#fff' }}>CityFlow</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:14, lineHeight:1.8, maxWidth:280 }}>
              A Digital Nervous System For Cities — connecting citizens and governments for smarter urban living.
            </p>
            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              {['𝕏','in','gh'].map((s,i) => (
                <div key={i} style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)',
                  border:`1px solid ${T.primary}20`, display:'flex', alignItems:'center', justifyContent:'center',
                  color:'rgba(255,255,255,0.35)', fontSize:13, cursor:'pointer' }}>{s}</div>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([cat,items]) => (
            <div key={cat}>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:700,
                letterSpacing:1.5, textTransform:'uppercase', marginBottom:16 }}>{cat}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {items.map(item => (
                  <a key={item} href="#" style={{ color:'rgba(255,255,255,0.28)', fontSize:14, textDecoration:'none', transition:'color 0.2s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color=T.blush)}
                    onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.28)')}>{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:`1px solid ${T.primary}12`, paddingTop:24,
          display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>© 2026 CityFlow. All rights reserved.</p>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:13 }}>Built with ❤️ for smarter cities</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBadges />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <ImpactStats />
      <CTA />
      <Footer />
    </>
  );
}