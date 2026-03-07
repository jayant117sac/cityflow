'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout, { C } from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

const FEATURES = [
  { icon:'🛣️', title:'Report City Issues', desc:'Geo-tagged reports routed instantly to the right department.' },
  { icon:'📊', title:'Live City Insights', desc:'Real-time data on traffic, air quality, and civic events.' },
  { icon:'🗳️', title:'Civic Engagement', desc:"Vote on local proposals and shape your city's future." },
  { icon:'🏆', title:'Earn Civic Points', desc:'Get rewarded for active participation in your community.' },
];

function RegisterLeft({ mounted }: { mounted: boolean }) {
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.7px]" style={{ color:'rgba(255,255,255,0.7)' }}>Free to join</span>
      </motion.div>
      <motion.h2 {...fade(0.15)} className="font-bold leading-[1.12] mb-4"
        style={{ fontFamily:'Georgia,serif', fontSize:'clamp(24px,2.6vw,36px)', color:C.white, letterSpacing:'-0.5px' }}>
        Be Part of the<br/>
        <span style={{ background:`linear-gradient(90deg,${C.alice},${C.primary})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>City You Deserve</span>
      </motion.h2>
      <motion.p {...fade(0.2)} className="text-[15px] leading-[1.72] mb-6" style={{ color:'rgba(255,255,255,0.44)', maxWidth:380 }}>
        Join thousands of active citizens making their cities smarter, safer, and more accountable every day.
      </motion.p>
      <motion.div {...fade(0.25)} className="flex gap-6 mb-7">
        {[{ val:'12k+', label:'Active Citizens' },{ val:'350+', label:'Issues / Week' },{ val:'98%', label:'Satisfaction' }].map((s,i) => (
          <div key={i}>
            <p className="font-bold" style={{ fontFamily:'Georgia,serif', fontSize:22, color:C.white }}>{s.val}</p>
            <p className="text-[11px]" style={{ color:'rgba(255,255,255,0.38)' }}>{s.label}</p>
          </div>
        ))}
      </motion.div>
      <div className="flex flex-col gap-2.5">
        {FEATURES.map((f,i) => (
          <motion.div key={i}
            initial={{ opacity:0, x:-16 }} animate={mounted ? { opacity:1, x:0 } : { opacity:0, x:-16 }}
            transition={{ duration:0.55, ease:[0.22,1,0.36,1], delay:0.3+i*0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
              style={{ background:`${C.primary}18`, border:`1px solid ${C.primary}28` }}>{f.icon}</div>
            <div>
              <p className="text-[13px] font-semibold mb-0.5" style={{ color:C.white }}>{f.title}</p>
              <p className="text-[12px] leading-snug" style={{ color:'rgba(255,255,255,0.38)' }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  return <AuthLayout leftContent={<RegisterLeft mounted={mounted}/>} rightContent={<RegisterForm/>}/>;
}