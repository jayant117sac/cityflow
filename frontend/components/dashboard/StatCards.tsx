'use client';
import { motion } from 'framer-motion';
import { Trophy, FileWarning, CheckCircle2, BellRing } from 'lucide-react';

interface Stats {
  civicScore:       number;
  reportsSubmitted: number;
  issuesResolved:   number;
  alertsNearby:     number;
}

interface StatCardsProps {
  stats:   Stats | null | undefined;
  loading: boolean;
}

const CARDS = [
  {
    key:     'civicScore' as keyof Stats,
    label:   'Civic Score',
    icon:    Trophy,
    color:   '#f59e0b',
    bg:      'rgba(245,158,11,0.08)',
    border:  'rgba(245,158,11,0.15)',
    suffix:  'pts',
  },
  {
    key:    'reportsSubmitted' as keyof Stats,
    label:  'Reports Submitted',
    icon:   FileWarning,
    color:  '#2274A5',
    bg:     'rgba(34,116,165,0.08)',
    border: 'rgba(34,116,165,0.15)',
    suffix: '',
  },
  {
    key:    'issuesResolved' as keyof Stats,
    label:  'Issues Resolved',
    icon:   CheckCircle2,
    color:  '#22c55e',
    bg:     'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.15)',
    suffix: '',
  },
  {
    key:    'alertsNearby' as keyof Stats,
    label:  'City Alerts Nearby',
    icon:   BellRing,
    color:  '#ef4444',
    bg:     'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.15)',
    suffix: '',
  },
];

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 animate-pulse"
      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="w-16 h-4 rounded-full bg-white/5" />
      </div>
      <div className="w-20 h-7 rounded-lg bg-white/5 mb-2" />
      <div className="w-28 h-3 rounded-full bg-white/5" />
    </div>
  );
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {CARDS.map((card, i) => {
        const Icon  = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, boxShadow: `0 12px 32px ${card.color}18` }}
            className="rounded-2xl p-5 cursor-default"
            style={{
              background: card.bg,
              border:     `1px solid ${card.border}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${card.color}18` }}
            >
              <Icon size={18} style={{ color: card.color }} />
            </div>

            {/* Value */}
            <p className="text-white font-bold text-2xl leading-none mb-1">
              {value.toLocaleString()}
              {card.suffix && (
                <span className="text-sm font-normal ml-1" style={{ color: card.color }}>
                  {card.suffix}
                </span>
              )}
            </p>

            {/* Label */}
            <p className="text-[12px]" style={{ color: '#4a6070' }}>{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}