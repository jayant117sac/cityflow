'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, Car, Users, HeartHandshake } from 'lucide-react';

const ACTIONS = [
  {
    icon:  AlertTriangle,
    title: 'Report Issue',
    desc:  'Submit potholes, streetlight problems, or civic issues.',
    href:  '/reports/new',
    color: '#ef4444',
    bg:    'rgba(239,68,68,0.08)',
  },
  {
    icon:  Car,
    title: 'Find Parking',
    desc:  'Locate available smart parking spots near you.',
    href:  '/parking',
    color: '#2274A5',
    bg:    'rgba(34,116,165,0.08)',
  },
  {
    icon:  Users,
    title: 'Community',
    desc:  'Connect with citizens, vote on local proposals.',
    href:  '/community',
    color: '#22c55e',
    bg:    'rgba(34,197,94,0.08)',
  },
  {
    icon:  HeartHandshake,
    title: 'Volunteer',
    desc:  'Give back to your city and earn civic points.',
    href:  '/community/volunteer',
    color: '#f59e0b',
    bg:    'rgba(245,158,11,0.08)',
  },
];

export default function QuickActions() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <h3 className="text-white font-semibold text-[15px] mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.href}
              onClick={() => router.push(action.href)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 12px 32px ${action.color}22`,
                borderColor: '#2274A5',
              }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left cursor-pointer outline-none transition-colors"
              style={{
                background:  '#131B23',
                border:      '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: action.bg }}
              >
                <Icon size={18} style={{ color: action.color }} />
              </div>

              {/* Text */}
              <div>
                <p className="text-white font-semibold text-[13px] leading-tight mb-1">
                  {action.title}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: '#4a6070' }}>
                  {action.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}