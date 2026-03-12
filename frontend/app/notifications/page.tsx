'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Bell, CheckCheck, Trash2, FileText,
  AlertTriangle, Users, Info, Clock, X, Search,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CityNotification {
  id:      string;
  title:   string;
  message: string;
  time:    string;
  type:    'report' | 'alert' | 'community' | 'system';
  read:    boolean;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  report:    { icon: FileText,      color: '#2274A5', bg: 'rgba(34,116,165,0.12)',  label: 'Report Update' },
  alert:     { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'City Alert'    },
  community: { icon: Users,         color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Community'     },
  system:    { icon: Info,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'System'        },
};

const FILTER_TABS = [
  { key: 'all',       label: 'All'            },
  { key: 'unread',    label: 'Unread'         },
  { key: 'report',    label: 'Report Updates' },
  { key: 'alert',     label: 'City Alerts'    },
  { key: 'community', label: 'Community'      },
  { key: 'system',    label: 'System'         },
];

const PLACEHOLDER: CityNotification[] = [
  { id: '1',  title: 'Report Assigned',         message: 'Your pothole report on FC Road has been assigned to the Road Maintenance department. Expected resolution in 3–5 business days.',        time: '2 hours ago', type: 'report',    read: false },
  { id: '2',  title: 'Road Closure Alert',       message: 'Road closure near FC Road due to construction work. Heavy traffic diversions expected on the route. Plan alternate routes.',           time: '3 hours ago', type: 'alert',     read: false },
  { id: '3',  title: 'Issue Resolved',           message: 'The Baner streetlight issue you reported has been marked as resolved by the Electric Department. Thank you for your contribution!',   time: 'Yesterday',   type: 'report',    read: false },
  { id: '4',  title: 'New Community Vote',       message: '"Cycling Lanes on FC Road" proposal is open for public voting. Your voice matters — cast your vote before Friday.',                   time: '2 days ago',  type: 'community', read: true  },
  { id: '5',  title: 'Power Outage Warning',     message: 'Scheduled power outage in the Baner area from 10 AM to 2 PM tomorrow. Prepare accordingly and charge your devices in advance.',       time: '2 days ago',  type: 'alert',     read: true  },
  { id: '6',  title: 'CityFlow Platform Update', message: 'Version 2.1 is now live! New features include real-time issue tracking, improved notifications, and an enhanced city map view.',      time: '3 days ago',  type: 'system',    read: true  },
  { id: '7',  title: 'Vote Counted',             message: 'Your vote on the Riverside Park renovation proposal has been recorded. View live results on the Community page.',                      time: '4 days ago',  type: 'community', read: true  },
  { id: '8',  title: 'Report In Progress',       message: 'Water leakage on main road in Wakad has been assigned to the Water Supply department. A field team has been dispatched.',             time: '5 days ago',  type: 'report',    read: true  },
  { id: '9',  title: 'Community Cleanup Drive',  message: 'A community cleanup event is happening at Riverside Park this Sunday at 8 AM. Join to earn 30 civic points!',                         time: '6 days ago',  type: 'community', read: true  },
  { id: '10', title: 'Civic Score Updated',      message: "Your civic score increased to 742 points after your last verified report. You're now a Level 3 City Guardian!",                       time: '1 week ago',  type: 'system',    read: true  },
  { id: '11', title: 'Heavy Traffic Alert',      message: 'Heavy traffic congestion reported on Hadapsar due to a broken traffic signal. Authorities have been notified. Allow extra time.',      time: '1 week ago',  type: 'alert',     read: true  },
  { id: '12', title: 'Achievement Unlocked',     message: "You've earned the \"City Watcher\" badge for being an active reporter for 30+ consecutive days. Keep up the great work!",              time: '1 week ago',  type: 'system',    read: true  },
];

function EmptyState({ filter }: { filter: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(34,116,165,0.1)', border: '1px solid rgba(34,116,165,0.2)' }}>
        <Bell size={28} style={{ color: '#2274A5' }} />
      </div>
      <h3 className="text-white font-semibold text-[16px] mb-2">
        {filter === 'unread' ? 'All caught up!' : 'No notifications'}
      </h3>
      <p className="text-[13px]" style={{ color: '#4a6070' }}>
        {filter === 'unread' ? 'You have no unread notifications.' : 'No notifications match this filter.'}
      </p>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState<CityNotification[]>(PLACEHOLDER);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d)) setNotifs(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = ()           => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const dismiss     = (id: string) => setNotifs(p => p.filter(n => n.id !== id));
  const clearAll    = ()           => setNotifs([]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const filtered = notifs.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (!['all', 'unread'].includes(filter) && n.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Date groups
  const today     = filtered.filter(n =>  n.time.includes('hour') || n.time === 'Just now');
  const yesterday = filtered.filter(n =>  n.time === 'Yesterday');
  const older     = filtered.filter(n => !n.time.includes('hour') && n.time !== 'Just now' && n.time !== 'Yesterday');
  const groups    = [
    ...(today.length     ? [{ label: 'Today',     items: today     }] : []),
    ...(yesterday.length ? [{ label: 'Yesterday', items: yesterday }] : []),
    ...(older.length     ? [{ label: 'Earlier',   items: older     }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: 'Georgia, serif' }}>
                Notifications
              </h1>
              <p className="text-[13px] mt-0.5" style={{ color: '#3a5060' }}>
                Stay updated on your reports and city events.
              </p>
            </div>
            {notifs.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={markAllRead}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
                    style={{ background: 'rgba(34,116,165,0.1)', border: '1px solid rgba(34,116,165,0.2)', color: '#2274A5' }}>
                    <CheckCheck size={13} /> Mark all read
                  </motion.button>
                )}
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  <Trash2 size={13} /> Clear all
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total',     value: notifs.length,                                  color: '#7a9ab0' },
            { label: 'Unread',    value: unreadCount,                                    color: '#ef4444' },
            { label: 'Alerts',    value: notifs.filter(n => n.type === 'alert').length,  color: '#ef4444' },
            { label: 'Reports',   value: notifs.filter(n => n.type === 'report').length, color: '#2274A5' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-4 py-3"
              style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: s.color }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="mb-4 space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3a5060' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notifications…"
              className="w-full pl-9 pr-10 py-2.5 rounded-xl text-[13px] outline-none transition"
              style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.06)', color: '#7a9ab0' }} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#4a6070' }}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => {
              const cnt = tab.key === 'all'    ? notifs.length
                        : tab.key === 'unread' ? unreadCount
                        : notifs.filter(n => n.type === tab.key).length;
              const active = filter === tab.key;
              return (
                <motion.button key={tab.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setFilter(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition"
                  style={{
                    background: active ? '#2274A5' : '#131B23',
                    border: `1px solid ${active ? '#2274A5' : 'rgba(255,255,255,0.07)'}`,
                    color: active ? 'white' : '#4a6070',
                  }}>
                  {tab.label}
                  {cnt > 0 && (
                    <span className="text-[10px] font-bold px-1 rounded"
                      style={{ background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: active ? 'white' : '#4a6070' }}>
                      {cnt}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#131B23' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="space-y-6">
            {groups.map(group => (
              <div key={group.label}>
                {/* Group heading */}
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={11} style={{ color: '#3a5060' }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#3a5060' }}>
                    {group.label}
                  </span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {group.items.map((n, i) => {
                      const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                      return (
                        <motion.div key={n.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ delay: i * 0.04 }}
                          className="group relative rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-colors"
                          style={{
                            background: n.read ? '#131B23' : 'rgba(34,116,165,0.06)',
                            border: `1px solid ${n.read ? 'rgba(255,255,255,0.05)' : 'rgba(34,116,165,0.2)'}`,
                          }}
                          onClick={() => markRead(n.id)}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}35`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = n.read ? 'rgba(255,255,255,0.05)' : 'rgba(34,116,165,0.2)'; }}>

                          {/* Unread bar */}
                          {!n.read && (
                            <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
                              style={{ background: cfg.color }} />
                          )}

                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                            <cfg.icon size={16} style={{ color: cfg.color }} />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-[14px] font-semibold"
                                    style={{ color: n.read ? '#7a9ab0' : 'white' }}>
                                    {n.title}
                                  </p>
                                  {!n.read && (
                                    <span className="w-2 h-2 rounded-full shrink-0"
                                      style={{ background: '#2274A5' }} />
                                  )}
                                </div>
                                <p className="text-[12px] leading-relaxed" style={{ color: '#4a6070' }}>
                                  {n.message}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{ background: cfg.bg, color: cfg.color }}>
                                    {cfg.label}
                                  </span>
                                  <span className="text-[11px]" style={{ color: '#3a5060' }}>{n.time}</span>
                                </div>
                              </div>

                              {/* Dismiss */}
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                style={{ background: 'rgba(255,255,255,0.06)', color: '#4a6070' }}>
                                <X size={12} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}