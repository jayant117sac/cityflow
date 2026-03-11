'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BellRing, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Alert {
  title:    string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  time:     string;
}

const PLACEHOLDER: Alert[] = [
  { title: 'Road Closure',     location: 'FC Road',        severity: 'high',   time: '1 hour ago' },
  { title: 'Power Outage',     location: 'Baner',          severity: 'high',   time: '2 hours ago' },
  { title: 'Heavy Traffic',    location: 'Hinjewadi',      severity: 'medium', time: '30 min ago' },
  { title: 'Water Disruption', location: 'Kothrud',        severity: 'medium', time: '3 hours ago' },
  { title: 'Community Event',  location: 'Riverside Park', severity: 'low',    time: 'Today' },
  { title: 'Park Maintenance', location: 'Shivajinagar',   severity: 'low',    time: 'Today' },
];

const SEV: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'HIGH' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'MED' },
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'LOW' },
};

function SkeletonAlert() {
  return (
    <div className="p-3 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex justify-between mb-2">
        <div className="h-3 w-32 rounded bg-white/5" />
        <div className="h-3 w-10 rounded bg-white/5" />
      </div>
      <div className="h-2.5 w-20 rounded bg-white/5" />
    </div>
  );
}

export default function CityAlertsPanel({ city = 'pune' }: { city?: string }) {
  const router  = useRouter();
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/city-alerts?city=${city}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(d => setAlerts(d ?? PLACEHOLDER))
      .catch(() => setAlerts(PLACEHOLDER))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-1 mb-4"
      >
        <div className="flex items-center gap-2">
          <BellRing size={15} style={{ color: '#ef4444' }} />
          <h3 className="text-white font-semibold text-[14px]">City Alerts</h3>
          {alerts.length > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              {alerts.length}
            </span>
          )}
        </div>
        <motion.button
          onClick={() => router.push('/dashboard/alerts')}
          whileHover={{ x: 2 }}
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: '#2274A5' }}
        >
          View All <ArrowRight size={11} />
        </motion.button>
      </div>

      {/* Alert list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
        {loading
          ? [1,2,3,4].map(i => <SkeletonAlert key={i} />)
          : alerts.map((alert, i) => {
              const s = SEV[alert.severity];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  whileHover={{ background: 'rgba(255,255,255,0.04)', x: 2 }}
                  className="p-3 rounded-xl cursor-default"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-[12px] font-semibold text-white leading-tight">{alert.title}</p>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Location + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MapPin size={10} style={{ color: '#3a5060' }} />
                      <span className="text-[11px]" style={{ color: '#4a6070' }}>{alert.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={10} style={{ color: '#3a5060' }} />
                      <span className="text-[10px]" style={{ color: '#3a5060' }}>{alert.time}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>

      {/* Footer CTA */}
      <motion.button
        onClick={() => router.push('/dashboard/alerts')}
        whileHover={{ background: 'rgba(34,116,165,0.15)' }}
        className="mt-4 w-full py-2.5 rounded-xl text-[12px] font-semibold transition-colors"
        style={{
          background: 'rgba(34,116,165,0.08)',
          border:     '1px solid rgba(34,116,165,0.2)',
          color:      '#2274A5',
        }}
      >
        Subscribe to Alerts
      </motion.button>
    </div>
  );
}