'use client';
import { motion } from 'framer-motion';

interface WelcomeSectionProps {
  userName: string;
  city?: string;
}

export default function WelcomeSection({ userName, city = 'Pune, MH' }: WelcomeSectionProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening';

  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl leading-tight">
            {greeting},{' '}
            <span style={{ color: '#2274A5' }}>{userName?.split(' ')[0]}</span> 👋
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: '#4a6070' }}>
            Here&apos;s what&apos;s happening in your city today.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[12px]" style={{ color: '#4a6070' }}>{date}</p>
          <div className="flex items-center justify-end gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="text-[12px] font-medium" style={{ color: '#2274A5' }}>{city}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}