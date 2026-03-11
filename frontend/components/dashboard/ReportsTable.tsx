'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, FileWarning } from 'lucide-react';

interface Report {
  title:      string;
  location:   string;
  department: string;
  status:     'Reported' | 'In Progress' | 'Resolved';
  date:       string;
}

const STATUS_STYLES: Record<Report['status'], { bg: string; color: string }> = {
  'Reported':    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  'In Progress': { bg: 'rgba(34,116,165,0.12)',  color: '#2274A5' },
  'Resolved':    { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
};

const PLACEHOLDER: Report[] = [
  { title: 'Pothole on FC Road',        location: 'Shivajinagar', department: 'Road Maintenance',   status: 'In Progress', date: '2 hours ago' },
  { title: 'Streetlight not working',   location: 'Baner',        department: 'Electric Department', status: 'Reported',    date: 'Yesterday'   },
  { title: 'Garbage not collected',     location: 'Kothrud',      department: 'Sanitation',          status: 'Resolved',    date: '3 days ago'  },
  { title: 'Water leakage on main road',location: 'Wakad',        department: 'Water Supply',        status: 'Reported',    date: '4 days ago'  },
];

function StatusBadge({ status }: { status: Report['status'] }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ background: s.color }}
      />
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3 rounded-full bg-white/5 animate-pulse" style={{ width: i === 1 ? '60%' : i === 4 ? '40%' : '50%' }} />
        </td>
      ))}
    </tr>
  );
}

export default function ReportsTable() {
  const router  = useRouter();
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports?user=current`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setReports(data ?? PLACEHOLDER))
      .catch(() => setReports(PLACEHOLDER))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden mb-6"
      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <FileWarning size={16} style={{ color: '#2274A5' }} />
          <h3 className="text-white font-semibold text-[15px]">My Recent Reports</h3>
        </div>
        <motion.button
          onClick={() => router.push('/reports')}
          whileHover={{ x: 2 }}
          className="flex items-center gap-1 text-[12px] font-medium transition-colors"
          style={{ color: '#2274A5' }}
        >
          View All
          <ArrowRight size={13} />
        </motion.button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {['Issue', 'Location', 'Department', 'Status', 'Date'].map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: '#3a5060' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[13px]" style={{ color: '#3a5060' }}>
                  No reports submitted yet.
                </td>
              </tr>
            ) : (
              reports.map((r, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(34,116,165,0.04)' }}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onClick={() => router.push('/reports')}
                >
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] font-medium text-white">{r.title}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px]" style={{ color: '#4a6070' }}>{r.location}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px]" style={{ color: '#4a6070' }}>{r.department}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12px]" style={{ color: '#3a5060' }}>{r.date}</p>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}