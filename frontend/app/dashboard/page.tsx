'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout   from '@/components/layout/DashboardLayout';
import WelcomeSection    from '@/components/dashboard/WelcomeSection';
import StatCards         from '@/components/dashboard/StatCards';
import QuickActions      from '@/components/dashboard/QuickActions';
import ReportsTable      from '@/components/dashboard/ReportsTable';
import CityInsights      from '@/components/dashboard/CityInsights';
import ActivityChart     from '@/components/dashboard/ActivityChart';
import MapPreview        from '@/components/dashboard/MapPreview';
import CityAlertsPanel   from '@/components/dashboard/CityAlertsPanel';

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
    <DashboardLayout
      rightPanel={
        <div className="rounded-2xl p-4 h-full" style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CityAlertsPanel city="pune" />
        </div>
      }
    >
      {/* 1. Welcome */}
      <WelcomeSection userName={user.name} />

      {/* 2. Stat Cards */}
      <StatCards stats={stats} loading={statsLoading} />

      {/* 3. Quick Actions */}
      <QuickActions />

      {/* 4. Recent Reports */}
      <ReportsTable />

      {/* 5. City Insights */}
      <CityInsights city="pune" />

      {/* 6. Weekly Activity Chart */}
      <ActivityChart />

      {/* 7. Map Preview */}
      <MapPreview city="pune" />
    </DashboardLayout>
  );
}