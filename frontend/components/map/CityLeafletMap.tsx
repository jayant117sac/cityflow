'use client';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Types defined locally ─────────────────────────────────────────────────────
interface IssueMarker   { lat: number; lng: number; title: string; status: string; location?: string; time?: string; }
interface ParkingMarker { lat: number; lng: number; title: string; spots: number; }
interface AlertMarker   { lat: number; lng: number; title: string; severity: string; time?: string; }

interface MapData {
  issues:  IssueMarker[];
  parking: ParkingMarker[];
  alerts:  AlertMarker[];
}

type SelectedItem =
  | { type: 'issue';   data: IssueMarker }
  | { type: 'parking'; data: ParkingMarker }
  | { type: 'alert';   data: AlertMarker };

// ── Fix Leaflet default icons ─────────────────────────────────────────────────
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER: [number, number] = [18.5204, 73.8567];

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

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

interface Props {
  mapData:      MapData;
  filters:      { issues: boolean; parking: boolean; alerts: boolean };
  onSelectItem: (item: SelectedItem) => void;
  onMapClick:   (lat: number, lng: number) => void;
}

export default function CityLeafletMap({ mapData, filters, onSelectItem, onMapClick }: Props) {
  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #1a2530 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip { background: #1a2530 !important; }
        .leaflet-popup-content { margin: 0 !important; line-height: 1.5 !important; }
        .leaflet-popup-close-button { color: #4a6070 !important; font-size: 18px !important; top: 8px !important; right: 10px !important; }
        .leaflet-popup-close-button:hover { color: white !important; }
        .leaflet-container { cursor: crosshair !important; }
      `}</style>

      <MapContainer
        center={CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Issue markers — Red */}
        {filters.issues && mapData.issues.map((m: IssueMarker, i: number) => (
          <CircleMarker
            key={`issue-${i}`}
            center={[m.lat, m.lng]}
            radius={9}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.85, weight: 2 }}
            eventHandlers={{ click: () => onSelectItem({ type: 'issue', data: m }) }}
          >
            <Popup>
              <div style={{ padding: '14px 16px', minWidth: 200 }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
                    color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '2px 8px', borderRadius: 20 }}>
                    Issue Report
                  </span>
                </div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{m.title}</p>
                {m.location && <p style={{ color: '#4a6070', fontSize: 12, marginBottom: 4 }}>📍 {m.location}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                    background: STATUS_COLOR[m.status] || '#4a6070' }} />
                  <span style={{ color: STATUS_COLOR[m.status] || '#4a6070', fontSize: 12, fontWeight: 600 }}>{m.status}</span>
                  {m.time && <span style={{ color: '#3a5060', fontSize: 11 }}>· {m.time}</span>}
                </div>
                <button onClick={() => onSelectItem({ type: 'issue', data: m })}
                  style={{ width: '100%', padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', fontSize: 12, fontWeight: 600 }}>
                  View Report →
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Parking markers — Blue */}
        {filters.parking && mapData.parking.map((m: ParkingMarker, i: number) => (
          <CircleMarker
            key={`parking-${i}`}
            center={[m.lat, m.lng]}
            radius={9}
            pathOptions={{ color: '#2274A5', fillColor: '#2274A5', fillOpacity: 0.85, weight: 2 }}
            eventHandlers={{ click: () => onSelectItem({ type: 'parking', data: m }) }}
          >
            <Popup>
              <div style={{ padding: '14px 16px', minWidth: 190 }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
                    color: '#2274A5', background: 'rgba(34,116,165,0.15)', padding: '2px 8px', borderRadius: 20 }}>
                    Smart Parking
                  </span>
                </div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🅿️ {m.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                    background: m.spots > 0 ? '#22c55e' : '#ef4444' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: m.spots > 0 ? '#22c55e' : '#ef4444' }}>
                    {m.spots > 0 ? `${m.spots} spots available` : 'Full'}
                  </span>
                </div>
                <button onClick={() => onSelectItem({ type: 'parking', data: m })}
                  style={{ width: '100%', padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(34,116,165,0.15)', border: '1px solid rgba(34,116,165,0.3)',
                    color: '#2274A5', fontSize: 12, fontWeight: 600 }}>
                  {m.spots > 0 ? 'Reserve Spot →' : 'Find Nearby →'}
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Alert markers — Yellow */}
        {filters.alerts && mapData.alerts.map((m: AlertMarker, i: number) => (
          <CircleMarker
            key={`alert-${i}`}
            center={[m.lat, m.lng]}
            radius={9}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.85, weight: 2 }}
            eventHandlers={{ click: () => onSelectItem({ type: 'alert', data: m }) }}
          >
            <Popup>
              <div style={{ padding: '14px 16px', minWidth: 190 }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
                    color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: 20 }}>
                    City Alert
                  </span>
                </div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>⚠️ {m.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                    background: SEV_COLOR[m.severity] || '#f59e0b' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: SEV_COLOR[m.severity] || '#f59e0b' }}>
                    {m.severity} severity
                  </span>
                </div>
                {m.time && <p style={{ color: '#3a5060', fontSize: 11, marginBottom: 12 }}>🕐 {m.time}</p>}
                <button onClick={() => onSelectItem({ type: 'alert', data: m })}
                  style={{ width: '100%', padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
                    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                    color: '#f59e0b', fontSize: 12, fontWeight: 600 }}>
                  View Alert →
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
}