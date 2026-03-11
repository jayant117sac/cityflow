'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Map, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the actual map to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr:     false,
  loading: () => (
    <div
      className="w-full h-64 rounded-xl animate-pulse flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      <p className="text-[13px]" style={{ color: '#3a5060' }}>Loading map…</p>
    </div>
  ),
});

interface MarkerData {
  lat:   number;
  lng:   number;
  title: string;
}

export interface MapData {
  issues:  MarkerData[];
  parking: MarkerData[];
  alerts:  MarkerData[];
}

const PLACEHOLDER: MapData = {
  issues:  [
    { lat: 18.5308, lng: 73.8476, title: 'Pothole' },
    { lat: 18.5214, lng: 73.8567, title: 'Streetlight broken' },
  ],
  parking: [
    { lat: 18.525,  lng: 73.849,  title: 'Parking A' },
    { lat: 18.528,  lng: 73.852,  title: 'Parking B' },
  ],
  alerts:  [
    { lat: 18.529,  lng: 73.845,  title: 'Road closure' },
  ],
};

export default function MapPreview({ city = 'pune' }: { city?: string }) {
  const router  = useRouter();
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cf_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/map-data?city=${city}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(d => setMapData(d ?? PLACEHOLDER))
      .catch(() => setMapData(PLACEHOLDER))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden mb-6"
      style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <Map size={15} style={{ color: '#2274A5' }} />
          <h3 className="text-white font-semibold text-[15px]">City Map Overview</h3>
        </div>
        <motion.button
          onClick={() => router.push('/map')}
          whileHover={{ x: 2 }}
          className="flex items-center gap-1 text-[12px] font-medium"
          style={{ color: '#2274A5' }}
        >
          Open Full Map <ArrowRight size={13} />
        </motion.button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 px-5 pt-3 pb-2">
        {[
          { color: '#ef4444', label: 'Issues' },
          { color: '#2274A5', label: 'Parking' },
          { color: '#f59e0b', label: 'Alerts' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[11px]" style={{ color: '#4a6070' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="px-5 pb-5">
        {!loading && mapData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden"
            style={{ height: 280 }}
          >
            <LeafletMap mapData={mapData} />
          </motion.div>
        )}
        {loading && (
          <div
            className="rounded-xl animate-pulse flex items-center justify-center"
            style={{ height: 280, background: 'rgba(255,255,255,0.03)' }}
          >
            <p className="text-[13px]" style={{ color: '#3a5060' }}>Loading map…</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}