'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronDown, Bell, MapPin, User,
  Settings, LogOut, CheckCheck, AlertTriangle,
  FileText, Users, Info, X,
} from 'lucide-react';

interface Notification {
  id:      string;
  title:   string;
  message: string;
  time:    string;
  type:    'report' | 'alert' | 'community' | 'system';
  read:    boolean;
}

const PLACEHOLDER_NOTIFS: Notification[] = [
  { id: '1', title: 'Report Assigned',     message: 'Your pothole report has been assigned to Road Maintenance.',   time: '2 hours ago', type: 'report',    read: false },
  { id: '2', title: 'Road Closure Alert',  message: 'Road closure near FC Road — expect heavy traffic diversions.', time: '3 hours ago', type: 'alert',     read: false },
  { id: '3', title: 'Issue Resolved',      message: 'Baner streetlight issue has been marked as resolved.',         time: 'Yesterday',   type: 'report',    read: false },
  { id: '4', title: 'Community Vote',      message: 'New proposal: "Cycling Lanes on FC Road" — cast your vote.',   time: '2 days ago',  type: 'community', read: true  },
  { id: '5', title: 'System Update',       message: 'CityFlow v2.1 — improved report tracking is now available.',   time: '3 days ago',  type: 'system',    read: true  },
  { id: '6', title: 'Power Outage Alert',  message: 'Scheduled power outage in Baner from 10AM–2PM today.',         time: '3 days ago',  type: 'alert',     read: true  },
];

const TYPE_CFG: Record<string, { icon: any; color: string; bg: string }> = {
  report:    { icon: FileText,      color: '#2274A5', bg: 'rgba(34,116,165,0.12)'  },
  alert:     { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  community: { icon: Users,         color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  system:    { icon: Info,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
};

export default function DashboardHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityOpen,     setCityOpen]     = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [city,         setCity]         = useState('Pune, MH');
  const [notifs,       setNotifs]       = useState<Notification[]>(PLACEHOLDER_NOTIFS);
  const headerRef = useRef<HTMLDivElement>(null);

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('cf_user') || '{}') : {};

  const cities = ['Pune, MH', 'Mumbai, MH', 'Nagpur, MH', 'Nashik, MH', 'Aurangabad, MH'];
  const unreadCount = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(d => { if (d) setNotifs(d); }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false); setCityOpen(false); setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const logout    = () => { localStorage.clear(); router.push('/login'); };
  const markRead  = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <header ref={headerRef}
      className="flex items-center justify-between px-6 py-3 shrink-0"
      style={{ background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a5060]" />
        <input type="text" placeholder="Search complaints, alerts, areas…"
          className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] text-[#7a9ab0] placeholder-[#3a5060] outline-none focus:ring-1 focus:ring-[#2274A5]/40 transition"
          style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.06)' }} />
      </div>

      <div className="flex items-center gap-3 ml-4">

        {/* City selector */}
        <div className="relative">
          <motion.button
            onClick={() => { setCityOpen(p => !p); setDropdownOpen(false); setNotifOpen(false); }}
            whileHover={{ background: 'rgba(34,116,165,0.12)' }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium"
            style={{ color: '#7a9ab0', border: '1px solid rgba(255,255,255,0.06)', background: '#131B23' }}>
            <MapPin size={13} className="text-[#2274A5]" />
            {city}
            <ChevronDown size={13} className={`transition-transform duration-200 ${cityOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {cityOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 w-44 rounded-xl overflow-hidden z-50 py-1"
                style={{ background: '#1a2530', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                {cities.map(c => (
                  <button key={c} onClick={() => { setCity(c); setCityOpen(false); }}
                    className="w-full text-left px-4 py-2 text-[13px] transition"
                    style={{ color: c === city ? '#2274A5' : '#7a9ab0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,116,165,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Notification Bell ── */}
        <div className="relative">
          <motion.button
            onClick={() => { setNotifOpen(p => !p); setDropdownOpen(false); setCityOpen(false); }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: notifOpen ? 'rgba(34,116,165,0.15)' : '#131B23',
              border: `1px solid ${notifOpen ? 'rgba(34,116,165,0.4)' : 'rgba(255,255,255,0.06)'}`,
              color: '#7a9ab0',
            }}>
            <Bell size={16} />
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: '#ef4444', boxShadow: '0 2px 6px rgba(239,68,68,0.5)' }}>
                {unreadCount}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.18 }}
                className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden"
                style={{ width: 360, background: '#131B23', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 48px rgba(0,0,0,0.5)' }}>

                {/* Dropdown header */}
                <div className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <Bell size={14} style={{ color: '#2274A5' }} />
                    <span className="text-white font-semibold text-[14px]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: '#2274A5' }}>
                        <CheckCheck size={11} /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#4a6070' }}>
                      <X size={11} />
                    </button>
                  </div>
                </div>

                {/* Notification list */}
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {notifs.slice(0, 6).map((n, i) => {
                    const cfg = TYPE_CFG[n.type] ?? TYPE_CFG.system;
                    return (
                      <motion.button key={n.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => markRead(n.id)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all"
                        style={{ background: n.read ? 'transparent' : 'rgba(34,116,165,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(34,116,165,0.04)')}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                          <cfg.icon size={13} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-semibold leading-tight"
                              style={{ color: n.read ? '#7a9ab0' : 'white' }}>{n.title}</p>
                            {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: '#2274A5' }} />}
                          </div>
                          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#4a6070' }}>{n.message}</p>
                          <p className="text-[10px] mt-1" style={{ color: '#3a5060' }}>{n.time}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer CTA */}
                <button
                  onClick={() => { router.push('/notifications'); setNotifOpen(false); }}
                  className="w-full py-3 text-[12px] font-semibold transition"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#2274A5', background: 'rgba(34,116,165,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,116,165,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,116,165,0.04)')}>
                  View All Notifications →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => { setDropdownOpen(p => !p); setCityOpen(false); setNotifOpen(false); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl"
            style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-7 h-7 rounded-lg bg-[#2274A5] flex items-center justify-center text-white text-[11px] font-bold">{initials}</div>
            <span className="text-[13px] font-medium text-[#7a9ab0] max-w-[80px] truncate">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={12} className={`text-[#3a5060] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 w-48 rounded-xl overflow-hidden z-50 py-1"
                style={{ background: '#1a2530', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#4a6070] truncate">{user?.email}</p>
                </div>
                {[
                  { icon: User,     label: 'Profile',       action: () => router.push('/profile') },
                  { icon: Bell,     label: 'Notifications', action: () => router.push('/notifications') },
                  { icon: Settings, label: 'Settings',      action: () => router.push('/dashboard/settings') },
                ].map(item => (
                  <button key={item.label} onClick={() => { item.action(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition"
                    style={{ color: '#7a9ab0' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,116,165,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
                <div className="border-t border-white/5 mt-1 pt-1">
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 transition"
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <LogOut size={14} /> Logout
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