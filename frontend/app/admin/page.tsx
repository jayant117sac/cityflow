'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const STATUSES = ['Pending', 'InProgress', 'Resolved'];

const statusColors: any = {
  Pending: 'bg-yellow-50 border-yellow-200',
  InProgress: 'bg-blue-50 border-blue-200',
  Resolved: 'bg-green-50 border-green-200',
};

const badgeColors: any = {
  Pending: 'bg-yellow-100 text-yellow-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    const parsedUser = JSON.parse(stored);
    if (parsedUser.role === 'citizen') { router.push('/dashboard'); return; }
    setUser(parsedUser);

    api.get('/api/complaints')
      .then(({ data }) => setComplaints(data))
      .finally(() => setLoading(false));
  }, [router]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/api/complaints/${id}/status`, { status, note: `Status changed to ${status}` });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } finally {
      setUpdating(null);
    }
  };

  const logout = () => { localStorage.clear(); router.push('/login'); };

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-blue-700">🏙️ CityFlow</h1>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👤 {user?.name}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-800">{total}</p>
            <p className="text-gray-500 text-sm">Total</p>
          </div>
          {STATUSES.map((s) => (
            <div key={s} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className={`text-3xl font-bold ${s === 'Pending' ? 'text-yellow-600' : s === 'InProgress' ? 'text-blue-600' : 'text-green-600'}`}>
                {complaints.filter((c) => c.status === s).length}
              </p>
              <p className="text-gray-500 text-sm">{s}</p>
            </div>
          ))}
        </div>

        {/* Resolution Rate */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Resolution Rate</span>
            <span className="text-sm font-bold text-green-600">{resolutionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>

        {/* Kanban Board */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Complaints Board</h2>
        {loading ? (
          <p className="text-gray-400">Loading complaints...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {STATUSES.map((status) => (
              <div key={status} className={`rounded-xl border-2 p-4 ${statusColors[status]}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">{status}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColors[status]}`}>
                    {complaints.filter((c) => c.status === status).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {complaints
                    .filter((c) => c.status === status)
                    .map((c) => (
                      <div key={c.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="font-medium text-gray-800 text-sm">{c.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{c.category} • {c.user?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{c.description.slice(0, 60)}...</p>

                        {/* Action buttons */}
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {STATUSES.filter((s) => s !== status).map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(c.id, s)}
                              disabled={updating === c.id}
                              className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 px-2 py-1 rounded transition disabled:opacity-50"
                            >
                              {updating === c.id ? '...' : `→ ${s}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                  {complaints.filter((c) => c.status === status).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No complaints</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}