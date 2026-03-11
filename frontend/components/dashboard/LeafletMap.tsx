'use client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { MapData } from './MapPreview';
import 'leaflet/dist/leaflet.css';

// Fix default icon — must be done at module level for Next.js
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  mapData: MapData;
}

// Pune city center
const CENTER: [number, number] = [18.5204, 73.8567];

export default function LeafletMap({ mapData }: Props) {

  return (
    <MapContainer
      center={CENTER}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      {/* Dark tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Issue markers — Red */}
      {mapData.issues.map((m, i) => (
        <CircleMarker
          key={`issue-${i}`}
          center={[m.lat, m.lng]}
          radius={8}
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.75, weight: 2 }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>⚠️ {m.title}</span>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Parking markers — Blue */}
      {mapData.parking.map((m, i) => (
        <CircleMarker
          key={`parking-${i}`}
          center={[m.lat, m.lng]}
          radius={8}
          pathOptions={{ color: '#2274A5', fillColor: '#2274A5', fillOpacity: 0.75, weight: 2 }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>🅿️ {m.title}</span>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Alert markers — Yellow */}
      {mapData.alerts.map((m, i) => (
        <CircleMarker
          key={`alert-${i}`}
          center={[m.lat, m.lng]}
          radius={8}
          pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.75, weight: 2 }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>🔔 {m.title}</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}