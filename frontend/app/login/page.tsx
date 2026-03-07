'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout, { C } from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

function DashboardPreview({ mounted }: { mounted: boolean }) {
  const fade = (d: number) => ({
    initial: { opacity:0, y:18 },
    animate: mounted ? { opacity:1, y:0 } : { opacity:0, y:18 },
    transition: { duration:0.65, ease:[0.22,1,0.36,1] as any, delay:d },
  });
  return (
    <div>
      <motion.div {...fade(0.1)} className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 mb-6"
        style={{ background:`${C.primary}1a`, border:`1px solid ${C.primary}35` }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#4CAF50', animation:'cfBlink 2s infinite' }}/>
        <span className="text-[11px] font-semibold uppercase tracking-[0.7px]" style={{ color:'rgba(255,255,255,0.7)' }}>Platform Live</span>
      </motion.div>
      <motion.h2 {...fade(0.15)} className="font-bold leading-[1.12] mb-4"
        style={{ fontFamily:'Georgia,serif', fontSize:'clamp(26px,2.8vw,38px)', color:C.white, letterSpacing:'-0.5px' }}>
        The Digital Nervous<br/>
        <span style={{ background:`linear-gradient(90deg,${C.alice},${C.primary})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>System of Your City</span>
      </motion.h2>
      <motion.p {...fade(0.2)} className="text-[15px] leading-[1.72] mb-8" style={{ color:'rgba(255,255,255,0.44)', maxWidth:380 }}>
        Access your city dashboard and civic tools. Report issues, track resolutions, and engage with your community in real time.
      </motion.p>
      <motion.div {...fade(0.3)} className="rounded-[18px] p-5"
        style={{ background:C.darkCard, border:`1px solid ${C.darkBorder}`, boxShadow:'0 24px 64px rgba(0,0,0,0.45)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background:'#4CAF50', animation:'cfBlink 2s infinite' }}/>
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color:'rgba(255,255,255,0.38)' }}>Live City Dashboard</span>
          </div>
          <div className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background:`${C.primary}1f`, color:C.alice }}>Pune, MH</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[{ label:'Civic Score', val:'742', icon:'🏆', c:C.primary },
            { label:'Reports', val:'8', icon:'📋', c:'#4CAF50' },
            { label:'Alerts', val:'3', icon:'🔔', c:'#F59E0B' }].map((s,i) => (
            <div key={i} className="rounded-xl p-3 text-center" style={{ background:'rgba(0,0,0,0.22)', border:`1px solid ${s.c}1a` }}>
              <span className="text-lg">{s.icon}</span>
              <p className="font-bold mt-1 mb-0.5" style={{ fontFamily:'Georgia,serif', fontSize:18, color:C.white }}>{s.val}</p>
              <p className="text-[9px] tracking-wider uppercase" style={{ color:'rgba(255,255,255,0.28)' }}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl px-3 py-2.5 mb-3" style={{ background:'rgba(0,0,0,0.2)', border:`1px solid ${C.primary}12` }}>
          <p className="text-[9px] uppercase tracking-widest mb-2.5" style={{ color:'rgba(255,255,255,0.3)' }}>Weekly Reports</p>
          <div className="flex gap-1 items-end" style={{ height:36 }}>
            {[28,52,38,72,50,88,64].map((h,i) => (
              <div key={i} className="flex-1 rounded-t-[3px]"
                style={{ height:`${h}%`, background: i===5 ? C.primary : `${C.primary}38`, boxShadow: i===5 ? `0 0 10px ${C.primary}55` : 'none' }}/>
            ))}
          </div>
          <div className="flex mt-1.5">
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <span key={i} className="flex-1 text-center" style={{ fontSize:9, color: i===5 ? C.primary : 'rgba(255,255,255,0.2)' }}>{d}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
          style={{ background:`${C.primary}12`, border:`1px solid ${C.primary}25` }}>
          <span className="text-base shrink-0">⚡</span>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color:C.white }}>Power Outage — Shivajinagar</p>
            <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.32)' }}>Est. restoration 2:00 PM today</p>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background:'#EF444420', color:'#EF4444' }}>HIGH</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  return <AuthLayout leftContent={<DashboardPreview mounted={mounted}/>} rightContent={<LoginForm/>}/>;
}