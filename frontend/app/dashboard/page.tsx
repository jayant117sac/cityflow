'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WelcomeSection  from '@/components/dashboard/WelcomeSection';
import StatCards       from '@/components/dashboard/StatCards';

interface Stats {
  civicScore:       number;
  reportsSubmitted: number;
  issuesResolved:   number;
  alertsNearby:     number;
}

interface User {
  id:    string;
  name:  string;
  email: string;
  role:  string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user,         setUser]         = useState<User | null>(null);
  const [stats,        setStats]        = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cf_user');
    if (!stored) { router.push('/login'); return; }

    const parsedUser = JSON.parse(stored) as User;
    const token      = localStorage.getItem('cf_token');

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setUser(parsedUser);
        setStats(data ?? { civicScore: 742, reportsSubmitted: 8, issuesResolved: 5, alertsNearby: 3 });
      })
      .catch(() => {
        setUser(parsedUser);
        setStats({ civicScore: 742, reportsSubmitted: 8, issuesResolved: 5, alertsNearby: 3 });
      })
      .finally(() => setStatsLoading(false));
  }, [router]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <WelcomeSection userName={user.name} />
      <StatCards stats={stats} loading={statsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <h3 className="text-white font-semibold text-[15px] mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {[
              { title: 'Pothole on FC Road',          status: 'InProgress', date: '2 days ago', cat: 'Roads' },
              { title: 'Street light not working',    status: 'Pending',    date: '4 days ago', cat: 'Electricity' },
              { title: 'Garbage not collected',       status: 'Resolved',   date: '1 week ago', cat: 'Garbage' },
            ].map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div>
                  <p className="text-[13px] font-medium text-white">{r.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#4a6070' }}>{r.cat} · {r.date}</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background:
                      r.status === 'Resolved'   ? 'rgba(34,197,94,0.12)'  :
                      r.status === 'InProgress' ? 'rgba(34,116,165,0.12)' :
                                                  'rgba(245,158,11,0.12)',
                    color:
                      r.status === 'Resolved'   ? '#22c55e' :
                      r.status === 'InProgress' ? '#2274A5' :
                                                  '#f59e0b',
                  }}
                >
                  {r.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* City Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl p-5"
          style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <h3 className="text-white font-semibold text-[15px] mb-4">City Alerts</h3>
          <div className="space-y-3">
            {[
              { title: 'Power Outage — Shivajinagar',      severity: 'HIGH', time: '2h ago' },
              { title: 'Water supply disruption — Kothrud', severity: 'MED',  time: '5h ago' },
              { title: 'Road closure — MG Road',           severity: 'LOW',  time: '1d ago' },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background:
                      a.severity === 'HIGH' ? '#ef4444' :
                      a.severity === 'MED'  ? '#f59e0b' : '#22c55e',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{a.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#4a6070' }}>{a.time}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background:
                      a.severity === 'HIGH' ? 'rgba(239,68,68,0.12)'  :
                      a.severity === 'MED'  ? 'rgba(245,158,11,0.12)' :
                                              'rgba(34,197,94,0.12)',
                    color:
                      a.severity === 'HIGH' ? '#ef4444' :
                      a.severity === 'MED'  ? '#f59e0b' : '#22c55e',
                  }}
                >
                  {a.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}