'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Plus, Filter, Search, MapPin, Clock,
  AlertTriangle, CheckCircle, Loader2, FileText,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Report {
  id:         string;
  title:      string;
  category:   string;
  location:   string | { lat: number; lng: number };
  status:     'Reported' | 'Assigned' | 'In Progress' | 'Resolved';
  department: string;
  date:       string;
  priority:   'Low' | 'Medium' | 'High';
}

// ── Placeholder ───────────────────────────────────────────────────────────────
const PLACEHOLDER: Report[] = [
  { id: '1', title: 'Pothole on FC Road',        category: 'Road Damage',            location: 'FC Road, Shivajinagar', status: 'In Progress', department: 'Road Maintenance',   date: '2 hours ago',  priority: 'High'   },
  { id: '2', title: 'Streetlight not working',   category: 'Streetlight Issue',      location: 'Baner',                 status: 'Reported',    department: 'Electric Dept',      date: 'Yesterday',    priority: 'Medium' },
  { id: '3', title: 'Garbage not collected',     category: 'Garbage Collection',     location: 'Kothrud',               status: 'Resolved',    department: 'Sanitation',         date: '3 days ago',   priority: 'Low'    },
  { id: '4', title: 'Water leakage on main road',category: 'Water Leakage',          location: 'Wakad',                 status: 'Reported',    department: 'Water Supply',       date: '4 days ago',   priority: 'High'   },
  { id: '5', title: 'Broken traffic signal',     category: 'Traffic Signal Problem', location: 'Hadapsar',              status: 'Assigned',    department: 'Traffic Management', date: '5 days ago',   priority: 'High'   },
  { id: '6', title: 'Damaged footpath',          category: 'Road Damage',            location: 'Aundh',                 status: 'In Progress', department: 'Road Maintenance',   date: '6 days ago',   priority: 'Medium' },
];

const CATEGORY_ICONS: Record<string, string> = {
  'Road Damage':            '🛣️',
  'Streetlight Issue':      '💡',
  'Garbage Collection':     '🗑️',
  'Water Leakage':          '💧',
  'Traffic Signal Problem': '🚦',
  'Public Safety':          '🛡️',
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { color: string; bg: string; dot: string }> = {
  'Reported':    { color: '#2274A5', bg: 'rgba(34,116,165,0.12)',  dot: '#2274A5' },
  'Assigned':    { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', dot: '#a855f7' },
  'In Progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  'Resolved':    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  dot: '#22c55e' },
};

const PRIORITY_COLOR: Record<string, string> = {
  Low:    '#22c55e',
  Medium: '#f59e0b',
  High:   '#ef4444',
};

// ── Stat mini-card ────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl px-4 py-3 text-center"
      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="font-bold text-xl" style={{ color }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: '#3a5060' }}>{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const router = useRouter();
  const [reports,  setReports]  = useState<Report[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<string>('All');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?user=current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => setReports(d ?? PLACEHOLDER))
      .catch(() => setReports(PLACEHOLDER))
      .finally(() => setLoading(false));
  }, []);

  const locationStr = (loc: Report['location']) =>
    typeof loc === 'string' ? loc : `${(loc as any).lat?.toFixed(4)}, ${(loc as any).lng?.toFixed(4)}`;

  const filtered = reports.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:        reports.length,
    reported:   reports.filter(r => r.status === 'Reported').length,
    inProgress: reports.filter(r => r.status === 'In Progress').length,
    resolved:   reports.filter(r => r.status === 'Resolved').length,
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-[22px] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              My Reports
            </h1>
            <p className="text-[13px]" style={{ color: '#3a5060' }}>
              Track all your submitted city issue reports.
            </p>
          </div>
          <motion.button
            onClick={() => router.push('/reports/new')}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(34,116,165,0.4)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
            style={{ background: '#2274A5', color: 'white', boxShadow: '0 4px 16px rgba(34,116,165,0.3)' }}
          >
            <Plus size={15} /> Report New Issue
          </motion.button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <MiniStat label="Total"       value={counts.all}        color="#4a6070" />
          <MiniStat label="Reported"    value={counts.reported}   color="#2274A5" />
          <MiniStat label="In Progress" value={counts.inProgress} color="#f59e0b" />
          <MiniStat label="Resolved"    value={counts.resolved}   color="#22c55e" />
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
            style={{
              background: searchFocused ? 'rgba(34,116,165,0.06)' : '#131B23',
              border: `1px solid ${searchFocused ? 'rgba(34,116,165,0.4)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s',
            }}>
            <Search size={13} style={{ color: '#3a5060' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search reports…"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: 'white' }}
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1.5">
            <Filter size={12} style={{ color: '#3a5060' }} />
            {['All', 'Reported', 'Assigned', 'In Progress', 'Resolved'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: filter === s
                    ? (STATUS[s]?.bg ?? 'rgba(34,116,165,0.15)')
                    : 'rgba(255,255,255,0.04)',
                  color: filter === s
                    ? (STATUS[s]?.color ?? '#2274A5')
                    : '#4a6070',
                  border: `1px solid ${filter === s ? (STATUS[s]?.dot ?? '#2274A5') + '40' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}>

          {/* Table header */}
          <div className="grid px-5 py-3"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
            {['Issue', 'Category', 'Location', 'Status', 'Department', 'Date'].map(h => (
              <p key={h} className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#3a5060' }}>{h}</p>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid px-5 py-4 animate-pulse"
                style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <div key={j} className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', width: '70%' }} />
                ))}
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <FileText size={28} style={{ color: '#3a5060' }} />
              <p className="text-[13px] font-semibold" style={{ color: '#4a6070' }}>
                {search || filter !== 'All' ? 'No matching reports' : 'No reports yet'}
              </p>
              {!search && filter === 'All' && (
                <button onClick={() => router.push('/reports/new')}
                  className="text-[12px] font-medium" style={{ color: '#2274A5' }}>
                  Submit your first report →
                </button>
              )}
            </div>
          ) : (
            filtered.map((r, i) => {
              const s = STATUS[r.status];
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                  className="grid px-5 py-4 cursor-pointer"
                  style={{
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    alignItems: 'center',
                  }}
                >
                  {/* Title */}
                  <div className="flex items-center gap-2 min-w-0 pr-3">
                    <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[r.category] ?? '📋'}</span>
                    <div className="min-w-0">
                      <p className="text-white text-[13px] font-medium truncate">{r.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: PRIORITY_COLOR[r.priority] }}>
                        ● {r.priority} priority
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <p className="text-[12px] truncate pr-2" style={{ color: '#4a6070' }}>{r.category}</p>

                  {/* Location */}
                  <div className="flex items-center gap-1 pr-2">
                    <MapPin size={10} style={{ color: '#3a5060', flexShrink: 0 }} />
                    <p className="text-[12px] truncate" style={{ color: '#4a6070' }}>{locationStr(r.location)}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: s.bg, color: s.color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {r.status}
                    </span>
                  </div>

                  {/* Department */}
                  <p className="text-[12px] truncate pr-2" style={{ color: '#4a6070' }}>{r.department}</p>

                  {/* Date */}
                  <div className="flex items-center gap-1">
                    <Clock size={10} style={{ color: '#3a5060' }} />
                    <p className="text-[11px]" style={{ color: '#3a5060' }}>{r.date}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}