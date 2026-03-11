'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, Wind, Car, Calendar } from 'lucide-react';

interface CityData {
  weather:    { temperature: number; condition: string };
  airQuality: { aqi: number; status: 'Good' | 'Moderate' | 'Poor' };
  traffic:    { level: 'Light' | 'Moderate' | 'Heavy' };
  events:     { count: number };
}

const PLACEHOLDER: CityData = {
  weather:    { temperature: 27, condition: 'Clear Sky' },
  airQuality: { aqi: 42, status: 'Good' },
  traffic:    { level: 'Moderate' },
  events:     { count: 5 },
};

const AQI_COLOR: Record<string, string> = {
  Good:     '#22c55e',
  Moderate: '#f59e0b',
  Poor:     '#ef4444',
};

const TRAFFIC_COLOR: Record<string, string> = {
  Light:    '#22c55e',
  Moderate: '#f59e0b',
  Heavy:    '#ef4444',
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-white/5" />
        <div className="w-24 h-3 rounded-full bg-white/5" />
      </div>
      <div className="w-16 h-6 rounded-lg bg-white/5 mb-2" />
      <div className="w-28 h-3 rounded-full bg-white/5" />
    </div>
  );
}

export default function CityInsights({ city = 'pune' }: { city?: string }) {
  const [data,    setData]    = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/city-insights?city=${city}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(d => setData(d ?? PLACEHOLDER))
      .catch(() => setData(PLACEHOLDER))
      .finally(() => setLoading(false));
  }, [city]);

  const cards = data ? [
    {
      icon:    CloudSun,
      label:   'Weather',
      color:   '#2274A5',
      bg:      'rgba(34,116,165,0.08)',
      value:   `${data.weather.temperature}°C`,
      sub:     data.weather.condition,
      subColor:'#4a6070',
    },
    {
      icon:    Wind,
      label:   'Air Quality',
      color:   AQI_COLOR[data.airQuality.status],
      bg:      `${AQI_COLOR[data.airQuality.status]}12`,
      value:   `AQI ${data.airQuality.aqi}`,
      sub:     data.airQuality.status,
      subColor: AQI_COLOR[data.airQuality.status],
    },
    {
      icon:    Car,
      label:   'Traffic',
      color:   TRAFFIC_COLOR[data.traffic.level],
      bg:      `${TRAFFIC_COLOR[data.traffic.level]}12`,
      value:   data.traffic.level,
      sub:     'Current traffic level',
      subColor:'#4a6070',
    },
    {
      icon:    Calendar,
      label:   'City Events',
      color:   '#f59e0b',
      bg:      'rgba(245,158,11,0.08)',
      value:   `${data.events.count}`,
      sub:     'Events today',
      subColor:'#4a6070',
    },
  ] : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-[15px]">City Insights</h3>
        <span className="text-[11px] font-medium" style={{ color: '#3a5060' }}>
          📍 {city.charAt(0).toUpperCase() + city.slice(1)}, MH
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading
          ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
          : cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.32 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ borderColor: '#2274A5', boxShadow: '0 8px 28px rgba(34,116,165,0.12)' }}
                  className="rounded-2xl p-5 cursor-default"
                  style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* Icon + label */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                      <Icon size={16} style={{ color: card.color }} />
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: '#4a6070' }}>{card.label}</span>
                  </div>

                  {/* Value */}
                  <p className="text-white font-bold text-xl leading-none mb-1">{card.value}</p>

                  {/* Sub */}
                  <p className="text-[12px] font-medium" style={{ color: card.subColor }}>{card.sub}</p>
                </motion.div>
              );
            })}
      </div>
    </motion.div>
  );
}