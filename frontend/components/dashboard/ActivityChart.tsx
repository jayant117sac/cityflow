'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DayData {
  day:     string;
  reports: number;
  votes:   number;
  posts:   number;
}

const PLACEHOLDER: DayData[] = [
  { day: 'Mon', reports: 1, votes: 2, posts: 0 },
  { day: 'Tue', reports: 0, votes: 3, posts: 1 },
  { day: 'Wed', reports: 2, votes: 1, posts: 0 },
  { day: 'Thu', reports: 1, votes: 0, posts: 2 },
  { day: 'Fri', reports: 0, votes: 2, posts: 1 },
  { day: 'Sat', reports: 1, votes: 1, posts: 0 },
  { day: 'Sun', reports: 0, votes: 0, posts: 0 },
];

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-[12px]"
      style={{ background: '#1a2530', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
    >
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span style={{ color: '#7a9ab0' }}>{p.name}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ActivityChart() {
  const [data,    setData]    = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(d => setData(d ?? PLACEHOLDER))
      .catch(() => setData(PLACEHOLDER))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 mb-6"
      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '1rem' }}
      >
        <div>
          <h3 className="text-white font-semibold text-[15px]">Weekly Civic Activity</h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#3a5060' }}>Your engagement over the past 7 days</p>
        </div>
        <span
          className="text-[11px] font-medium px-3 py-1 rounded-full"
          style={{ background: 'rgba(34,116,165,0.1)', color: '#2274A5', border: '1px solid rgba(34,116,165,0.2)' }}
        >
          Last 7 Days
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        {[
          { key: 'Reports', color: '#2274A5' },
          { key: 'Votes',   color: '#22c55e' },
          { key: 'Posts',   color: '#f59e0b' },
        ].map(l => (
          <div key={l.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            <span className="text-[12px]" style={{ color: '#4a6070' }}>{l.key}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barCategoryGap="35%" barGap={3}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: '#3a5060', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#3a5060', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={24}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey="reports"
              name="Reports"
              fill="#2274A5"
              radius={[4, 4, 0, 0]}
              isAnimationActive={animate}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="votes"
              name="Votes"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
              isAnimationActive={animate}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="posts"
              name="Posts"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              isAnimationActive={animate}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}