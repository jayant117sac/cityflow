'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// ── Palette ───────────────────────────────────────────────────────────────────
export const C = {
  primary:    '#2274A5',
  dark:       '#131B23',
  darkCard:   '#1A2533',
  darkBorder: 'rgba(34,116,165,0.18)',
  alice:      '#E9F1F7',
  sand:       '#E7DFC6',
  text:       '#131B23',
  muted:      '#5A6A7A',
  white:      '#FFFFFF',
  error:      '#DC2626',
  success:    '#16A34A',
  bg:         '#F0F4F8',
};

// ── Page transition variants ──────────────────────────────────────────────────
// Left panel slides out opposite to where the new page comes from:
//   /login  → slides in from the left  (index 0)
//   /register → slides in from the right (index 1)
const PAGE_ORDER: Record<string, number> = {
  '/login':    0,
  '/register': 1,
};

const leftVariants = {
  initial:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  animate:  { opacity: 1, x: 0 },
  exit:     (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
};

const rightVariants = {
  initial:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate:  { opacity: 1, x: 0 },
  exit:     (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// ── Layout ────────────────────────────────────────────────────────────────────
interface AuthLayoutProps {
  leftContent:  ReactNode;
  rightContent: ReactNode;
}

export default function AuthLayout({ leftContent, rightContent }: AuthLayoutProps) {
  const pathname = usePathname();
  const dir      = PAGE_ORDER[pathname] ?? 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: C.dark,
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT PANEL ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #0C1219 0%, #131B23 45%, #0e1e2e 100%)',
          minHeight: '100vh',
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${C.primary} 1px,transparent 1px),linear-gradient(90deg,${C.primary} 1px,transparent 1px)`,
          backgroundSize: '48px 48px',
        }}/>
        {/* Cerulean glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '-8%',
          width: 480, height: 480, borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle,${C.primary}1a 0%,transparent 65%)`,
          filter: 'blur(64px)',
        }}/>
        {/* Sand glow */}
        <div style={{
          position: 'absolute', bottom: '5%', right: '-5%',
          width: 340, height: 340, borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle,${C.sand}0d 0%,transparent 65%)`,
          filter: 'blur(64px)',
        }}/>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 10, padding: '32px 40px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg,${C.primary},#1a5a82)`,
              boxShadow: `0 4px 16px ${C.primary}50`, flexShrink: 0,
            }}>🏙️</div>
            <div>
              <div style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: 19, color: C.white, lineHeight: 1.2 }}>CityFlow</div>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)' }}>Smart City Platform</div>
            </div>
          </Link>
        </div>

        {/* Animated left content */}
        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px 32px' }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={pathname + '-left'}
              custom={dir}
              variants={leftVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={TRANSITION}
            >
              {leftContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust badges */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 40px 32px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['🔐 Govt-Grade Security', '🏛️ 40+ Departments', '👥 12k+ Citizens'].map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '5px 12px',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={pathname + '-right'}
            custom={dir}
            variants={rightVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITION}
            style={{ width: '100%', maxWidth: 420 }}
          >
            {rightContent}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes cfBlink { 0%,100%{opacity:1} 50%{opacity:0.28} }
        @keyframes cfSpin  { to{transform:rotate(360deg)} }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}