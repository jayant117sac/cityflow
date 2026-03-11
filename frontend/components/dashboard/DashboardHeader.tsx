'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Bell, MapPin, User, Settings, LogOut } from 'lucide-react';

export default function DashboardHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityOpen,     setCityOpen]     = useState(false);
  const [city,         setCity]         = useState('Pune, MH');
  const [notifCount]                    = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('cf_user') || '{}')
    : {};

  const cities = ['Pune, MH', 'Mumbai, MH', 'Nagpur, MH', 'Nashik, MH', 'Aurangabad, MH'];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header
      className="flex items-center justify-between px-6 py-3 shrink-0"
      style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Search bar */}
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a5060]" />
        <input
          type="text"
          placeholder="Search complaints, alerts, areas…"
          className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] text-[#7a9ab0] placeholder-[#3a5060] outline-none focus:ring-1 focus:ring-[#2274A5]/40 transition"
          style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.06)' }}
        />
      </div>

      <div className="flex items-center gap-3 ml-4" ref={dropdownRef}>
        {/* City selector */}
        <div className="relative">
          <motion.button
            onClick={() => { setCityOpen(p => !p); setDropdownOpen(false); }}
            whileHover={{ background: 'rgba(34,116,165,0.12)' }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition"
            style={{ color: '#7a9ab0', border: '1px solid rgba(255,255,255,0.06)', background: '#131B23' }}
          >
            <MapPin size={13} className="text-[#2274A5]" />
            {city}
            <ChevronDown size={13} className={`transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {cityOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 w-44 rounded-xl overflow-hidden z-50 py-1"
                style={{ background: '#1a2530', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
              >
                {cities.map(c => (
                  <button
                    key={c}
                    onClick={() => { setCity(c); setCityOpen(false); }}
                    className="w-full text-left px-4 py-2 text-[13px] transition"
                    style={{ color: c === city ? '#2274A5' : '#7a9ab0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,116,165,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.06)', color: '#7a9ab0' }}
        >
          <Bell size={16} />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2274A5] text-white text-[9px] font-bold flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </motion.button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => { setDropdownOpen(p => !p); setCityOpen(false); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl"
            style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="w-7 h-7 rounded-lg bg-[#2274A5] flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </div>
            <span className="text-[13px] font-medium text-[#7a9ab0] max-w-20 truncate">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={12} className={`text-[#3a5060] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 w-48 rounded-xl overflow-hidden z-50 py-1"
                style={{ background: '#1a2530', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#4a6070] truncate">{user?.email}</p>
                </div>

                {[
                  { icon: User,     label: 'Profile',  action: () => router.push('/dashboard/profile') },
                  { icon: Settings, label: 'Settings', action: () => router.push('/dashboard/settings') },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition"
                    style={{ color: '#7a9ab0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,116,165,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}

                <div className="border-t border-white/5 mt-1 pt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 transition"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}   