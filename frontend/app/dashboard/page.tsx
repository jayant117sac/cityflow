'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ComplaintsMap = dynamic(() => import('@/components/ComplaintsMap'), {
  ssr: false,
  loading: () => <div className="bg-gray-100 rounded-xl h-96 animate-pulse" />,
});
import api from '@/lib/api';

interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Resolved' | 'Rejected';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const statusColor: Record<string, string> = {
  Pending:    'bg-yellow-100 text-yellow-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Resolved:   'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-700',
};

export default function Dashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [user, setUser]             = useState<User | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('cf_user'); // ✅ fixed key
    if (!stored) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(stored) as User;

    api.get('/api/complaints')
      .then(({ data }: { data: Complaint[] }) => {
        setUser(parsedUser);
        setComplaints(data);
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">🏙️ CityFlow</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👋 {user?.name}</span>
          <Link
            href="/dashboard/submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Report Issue
          </Link>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['Pending', 'InProgress', 'Resolved'] as const).map((s) => (
            <div key={s} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-700">
                {complaints.filter((c) => c.status === s).length}
              </p>
              <p className="text-gray-500 text-sm">{s}</p>
            </div>
          ))}
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">📍 Complaint Locations</h2>
          <ComplaintsMap complaints={complaints} />
        </div>

        {/* Complaints List */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Complaints</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-400 mb-4">No complaints yet</p>
            <Link
              href="/dashboard/submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Report your first issue
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{c.title}</p>
                  <p className="text-sm text-gray-500">
                    {c.category} • {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{c.description.slice(0, 80)}...</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[c.status]}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}