'use client';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileWarning,
  Users,
  ParkingCircle,
  BellRing,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard',      icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Report Issue',   icon: FileWarning,     href: '/dashboard/report' },
  { label: 'Community',      icon: Users,           href: '/dashboard/community' },
  { label: 'Smart Parking',  icon: ParkingCircle,   href: '/dashboard/parking' },
  { label: 'City Alerts',    icon: BellRing,        href: '/dashboard/alerts' },
  { label: 'My Reports',     icon: ClipboardList,   href: '/dashboard/my-reports' },
  { label: 'Settings',       icon: Settings,        href: '/dashboard/settings' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 228 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full shrink-0 overflow-hidden"
      style={{ background: '#131B23', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 mb-2">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 text-lg"
          style={{
            background:  'linear-gradient(135deg, #2274A5, #1a5a82)',
            boxShadow:   '0 4px 12px rgba(34,116,165,0.4)',
          }}
        >
          🏙️
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <p style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1 }}>CityFlow</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 2 }}>Smart City Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              whileHover={{ x: collapsed ? 0 : 3 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left relative overflow-hidden group"
              style={{
                background: isActive ? 'rgba(34,116,165,0.18)' : 'transparent',
                color:      isActive ? '#2274A5' : '#7a9ab0',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: '#2274A5' }}
                />
              )}

              {/* Hover bg */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{ background: isActive ? 'transparent' : 'rgba(255,255,255,0.03)' }}
                transition={{ duration: 0.15 }}
              />

              <Icon
                size={18}
                className="shrink-0 relative z-10"
                style={{ color: isActive ? '#2274A5' : '#4a6070' }}
              />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="text-[13px] font-medium relative z-10 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 mt-2 border-t border-white/5 pt-3">
        <motion.button
          onClick={logout}
          whileHover={{ x: collapsed ? 0 : 3 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4a6070] hover:text-red-400 transition-colors group"
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="text-[13px] font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse toggle */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.1, background: '#2274A5' }}
        whileTap={{ scale: 0.95 }}
        className="absolute -right-3.5 top-7 w-7 h-7 rounded-full flex items-center justify-center z-20"
        style={{
          background:  '#1e2d38',
          border:      '1.5px solid rgba(34,116,165,0.3)',
          color:       '#2274A5',
          boxShadow:   '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </motion.button>
    </motion.aside>
  );
}