'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentType } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import {
  AlertTriangle, Car, Bell, Layers, X,
  MapPin, Clock, Flag, ChevronRight,
  Filter, Navigation, RefreshCw,
} from 'lucide-react';

// ── Types (defined locally — no external types file needed) ───────────────────
export interface IssueMarker   { lat: number; lng: number; title: string; status: string; location?: string; time?: string; }
export interface ParkingMarker { lat: number; lng: number; title: string; spots: number; }
export interface AlertMarker   { lat: number; lng: number; title: string; severity: string; time?: string; }

export interface MapData {
  issues:  IssueMarker[];
  parking: ParkingMarker[];
  alerts:  AlertMarker[];
}

export type SelectedItem =
  | { type: 'issue';   data: IssueMarker }
  | { type: 'parking'; data: ParkingMarker }
  | { type: 'alert';   data: AlertMarker };

interface CityLeafletMapProps {
  mapData:      MapData;
  filters:      { issues: boolean; parking: boolean; alerts: boolean };
  onSelectItem: (item: SelectedItem) => void;
  onMapClick:   (lat: number, lng: number) => void;
}

// ── Dynamic map (no SSR) ──────────────────────────────────────────────────────
const CityLeafletMap = dynamic<CityLeafletMapProps>(
  () => import('@/components/map/CityLeafletMap') as Promise<{ default: ComponentType<CityLeafletMapProps> }>,
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ background: '#0d1117' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
        <p className="text-[13px]" style={{ color: '#3a5060' }}>Loading city map…</p>
      </div>
    ),
  }
);

// ── Placeholder data ──────────────────────────────────────────────────────────
const PLACEHOLDER: MapData = {
  issues: [
    { lat: 18.5308, lng: 73.8476, title: 'Pothole on FC Road',        status: 'In Progress', location: 'FC Road',      time: '2 hours ago' },
    { lat: 18.5214, lng: 73.8567, title: 'Streetlight broken',        status: 'Reported',    location: 'Deccan',       time: 'Yesterday'   },
    { lat: 18.5180, lng: 73.8550, title: 'Garbage not collected',      status: 'Resolved',    location: 'Kothrud',      time: '3 days ago'  },
    { lat: 18.5320, lng: 73.8610, title: 'Water leakage on main road', status: 'Reported',    location: 'Wakad',        time: '4 days ago'  },
    { lat: 18.5270, lng: 73.8430, title: 'Road cave-in near market',   status: 'In Progress', location: 'Shivajinagar', time: '1 day ago'   },
  ],
  parking: [
    { lat: 18.5250, lng: 73.8490, title: 'Parking A — Deccan',       spots: 12 },
    { lat: 18.5280, lng: 73.8520, title: 'Parking B — FC Road',      spots: 4  },
    { lat: 18.5230, lng: 73.8600, title: 'Parking C — Shivajinagar', spots: 0  },
  ],
  alerts: [
    { lat: 18.5290, lng: 73.8450, title: 'Road closure',    severity: 'High', time: '1 hour ago'  },
    { lat: 18.5340, lng: 73.8500, title: 'Power outage',    severity: 'High', time: '2 hours ago' },
    { lat: 18.5200, lng: 73.8480, title: 'Community event', severity: 'Low',  time: 'Today'       },
  ],
};

// ── Status badge color ────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  'In Progress': '#f59e0b',
  'Reported':    '#2274A5',
  'Resolved':    '#22c55e',
};
const SEV_COLOR: Record<string, string> = {
  'High':   '#ef4444',
  'Medium': '#f59e0b',
  'Low':    '#22c55e',
};

// ── Filter pill ───────────────────────────────────────────────────────────────
function FilterPill({
  icon: Icon, label, active, count, color, onClick,
}: { icon: any; label: string; active: boolean; count: number; color: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
      style={{
        background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
        border:     `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.08)'}`,
        color:      active ? color : '#4a6070',
      }}
    >
      <Icon size={12} />
      {label}
      <span
        className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: active ? `${color}25` : 'rgba(255,255,255,0.06)', color: active ? color : '#3a5060' }}
      >
        {count}
      </span>
    </motion.button>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ item, onClose, onReportNew }: {
  item: SelectedItem;
  onClose: () => void;
  onReportNew: (lat: number, lng: number) => void;
}) {
  const router = useRouter();

  const isIssue   = item.type === 'issue';
  const isParking = item.type === 'parking';
  const isAlert   = item.type === 'alert';

  const typeColor = isIssue ? '#ef4444' : isParking ? '#2274A5' : '#f59e0b';
  const typeLabel = isIssue ? 'Issue Report' : isParking ? 'Smart Parking' : 'City Alert';
  const TypeIcon  = isIssue ? AlertTriangle : isParking ? Car : Bell;

  const lat = item.data.lat;
  const lng = item.data.lng;

  return (
    <motion.div
      key={item.data.title}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${typeColor}18`, border: `1px solid ${typeColor}30` }}>
            <TypeIcon size={14} style={{ color: typeColor }} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: typeColor }}>
            {typeLabel}
          </span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#4a6070' }}>
          <X size={13} />
        </button>
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-[16px] leading-snug mb-4">{item.data.title}</h3>

      {/* Details */}
      <div className="flex flex-col gap-2.5 mb-5">
        <div className="flex items-center gap-2">
          <MapPin size={12} style={{ color: '#3a5060' }} />
          <span className="text-[12px]" style={{ color: '#4a6070' }}>
            {isIssue   ? (item.data as IssueMarker).location   || 'Pune, MH' : ''}
            {isParking ? 'Pune, MH' : ''}
            {isAlert   ? 'Pune, MH' : ''}
          </span>
        </div>

        {isIssue && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLOR[(item.data as IssueMarker).status] || '#4a6070' }} />
            <span className="text-[12px] font-medium" style={{ color: STATUS_COLOR[(item.data as IssueMarker).status] || '#4a6070' }}>
              {(item.data as IssueMarker).status}
            </span>
          </div>
        )}

        {isParking && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"
              style={{ background: (item.data as ParkingMarker).spots > 0 ? '#22c55e' : '#ef4444' }} />
            <span className="text-[12px] font-medium"
              style={{ color: (item.data as ParkingMarker).spots > 0 ? '#22c55e' : '#ef4444' }}>
              {(item.data as ParkingMarker).spots > 0
                ? `${(item.data as ParkingMarker).spots} spots available`
                : 'No spots available'}
            </span>
          </div>
        )}

        {isAlert && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"
              style={{ background: SEV_COLOR[(item.data as AlertMarker).severity] || '#f59e0b' }} />
            <span className="text-[12px] font-medium"
              style={{ color: SEV_COLOR[(item.data as AlertMarker).severity] || '#f59e0b' }}>
              {(item.data as AlertMarker).severity} severity
            </span>
          </div>
        )}

        {(isIssue || isAlert) && (
          <div className="flex items-center gap-2">
            <Clock size={12} style={{ color: '#3a5060' }} />
            <span className="text-[12px]" style={{ color: '#3a5060' }}>
              {isIssue
                ? (item.data as IssueMarker).time || '—'
                : (item.data as AlertMarker).time || '—'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Navigation size={12} style={{ color: '#3a5060' }} />
          <span className="text-[11px] font-mono" style={{ color: '#3a5060' }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <motion.button
          whileHover={{ background: `${typeColor}25` }}
          onClick={() => router.push('/dashboard/my-reports')}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{ background: `${typeColor}15`, border: `1px solid ${typeColor}30`, color: typeColor }}
        >
          View Details <ChevronRight size={13} />
        </motion.button>

        <motion.button
          whileHover={{ background: 'rgba(255,255,255,0.07)' }}
          onClick={() => onReportNew(lat, lng)}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a6070' }}
        >
          Report Similar Issue <Flag size={12} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ data }: { data: MapData }) {
  return (
    <div className="flex items-center gap-4">
      {[
        { label: 'Issues',  val: data.issues.length,  color: '#ef4444' },
        { label: 'Parking', val: data.parking.length, color: '#2274A5' },
        { label: 'Alerts',  val: data.alerts.length,  color: '#f59e0b' },
      ].map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          <span className="text-[11px] font-semibold" style={{ color: s.color }}>{s.val}</span>
          <span className="text-[11px]" style={{ color: '#3a5060' }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MapPage() {
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mapData,    setMapData]    = useState<MapData>(PLACEHOLDER);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<SelectedItem | null>(null);
  const [filters,    setFilters]    = useState({ issues: true, parking: true, alerts: true });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback((showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/map-data?city=pune`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) setMapData(d);
      })
      .catch(() => {/* already have PLACEHOLDER */})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    router.push(`/reports/new?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}`);
  };

  const toggleFilter = (key: keyof typeof filters) =>
    setFilters(f => ({ ...f, [key]: !f[key] }));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1117' }}>
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#0d1117' }}
        >
          <div>
            <h1 className="text-white font-bold text-[18px]" style={{ fontFamily: 'Georgia, serif' }}>
              City Map
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: '#3a5060' }}>
              Explore issues, parking, and city alerts in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!loading && <StatsBar data={mapData} />}

            <motion.button
              onClick={() => fetchData(true)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a6070' }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div
          className="flex items-center gap-2 px-6 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}
        >
          <Filter size={12} style={{ color: '#3a5060' }} />
          <span className="text-[11px] font-medium mr-1" style={{ color: '#3a5060' }}>Filter:</span>
          <FilterPill icon={AlertTriangle} label="Issues"  active={filters.issues}  count={mapData.issues.length}  color="#ef4444" onClick={() => toggleFilter('issues')} />
          <FilterPill icon={Car}           label="Parking" active={filters.parking} count={mapData.parking.length} color="#2274A5" onClick={() => toggleFilter('parking')} />
          <FilterPill icon={Bell}          label="Alerts"  active={filters.alerts}  count={mapData.alerts.length}  color="#f59e0b" onClick={() => toggleFilter('alerts')} />

          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-[11px]" style={{ color: '#22c55e' }}>Live</span>
            <span className="text-[11px]" style={{ color: '#3a5060' }}>· Pune, MH</span>
          </div>
        </div>

        {/* Map + panel row */}
        <div className="flex flex-1 overflow-hidden">

          {/* Map */}
          <div className="flex-1 relative overflow-hidden">
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <CityLeafletMap
                  mapData={mapData}
                  filters={filters}
                  onSelectItem={setSelected}
                  onMapClick={handleMapClick}
                />
              </motion.div>
            )}
            {loading && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#2274A5] border-t-transparent animate-spin" />
                <p className="text-[13px]" style={{ color: '#3a5060' }}>Loading city map…</p>
              </div>
            )}

            {/* Click hint */}
            {!loading && !selected && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium pointer-events-none"
                style={{ background: 'rgba(19,27,35,0.9)', border: '1px solid rgba(255,255,255,0.08)', color: '#4a6070' }}
              >
                <MapPin size={12} style={{ color: '#2274A5' }} />
                Click a marker to view details · Click map to report an issue
              </motion.div>
            )}
          </div>

          {/* Right detail panel */}
          <div
            className="w-72 shrink-0 overflow-y-auto p-5"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#0d1117' }}
          >
            <AnimatePresence mode="wait">
              {selected ? (
                <DetailPanel
                  key={selected.data.title}
                  item={selected}
                  onClose={() => setSelected(null)}
                  onReportNew={handleMapClick}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center pt-20 gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2"
                    style={{ background: 'rgba(34,116,165,0.1)', border: '1px solid rgba(34,116,165,0.2)' }}
                  >
                    <Layers size={20} style={{ color: '#2274A5' }} />
                  </div>
                  <p className="text-[13px] font-semibold text-white">No item selected</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#3a5060' }}>
                    Click any marker on the map to view its details here.
                  </p>

                  {/* Quick legend */}
                  <div
                    className="w-full mt-6 rounded-xl p-4 text-left"
                    style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#3a5060' }}>Legend</p>
                    {[
                      { color: '#ef4444', label: 'Issue Reports',   icon: AlertTriangle },
                      { color: '#2274A5', label: 'Smart Parking',   icon: Car },
                      { color: '#f59e0b', label: 'City Alerts',     icon: Bell },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-2.5 mb-2 last:mb-0">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: `${l.color}15` }}>
                          <l.icon size={11} style={{ color: l.color }} />
                        </div>
                        <span className="text-[12px]" style={{ color: '#4a6070' }}>{l.label}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ background: 'rgba(34,116,165,0.2)' }}
                    onClick={() => router.push('/reports/new')}
                    className="mt-4 w-full py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(34,116,165,0.1)',
                      border: '1px solid rgba(34,116,165,0.25)',
                      color: '#2274A5',
                    }}
                  >
                    <Flag size={12} /> Report New Issue
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}