'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Known Pune area coords mapped to issue locations
const LOCATION_COORDS: Record<string, [number, number]> = {
  'Shivajinagar': [18.5308, 73.8470],
  'Baner':        [18.5590, 73.7868],
  'Kothrud':      [18.5074, 73.8078],
  'Wakad':        [18.5975, 73.7618],
  'Hadapsar':     [18.5018, 73.9260],
  'Aundh':        [18.5581, 73.8074],
  'Katraj':       [18.4530, 73.8626],
  'Pune Station': [18.5285, 73.8738],
  'Hinjewadi':    [18.5912, 73.7389],
  'Pashan':       [18.5314, 73.7937],
  'Viman Nagar':  [18.5679, 73.9143],
  'Kondhwa':      [18.4591, 73.8909],
};

// Density hotspots for background heatmap circles
const HOTSPOTS = [
  { center: [18.5204, 73.8567] as [number,number], radius: 1800, intensity: 'high'   },
  { center: [18.5308, 73.8470] as [number,number], radius: 1200, intensity: 'high'   },
  { center: [18.5590, 73.7868] as [number,number], radius: 900,  intensity: 'medium' },
  { center: [18.5074, 73.8078] as [number,number], radius: 1100, intensity: 'medium' },
  { center: [18.5018, 73.9260] as [number,number], radius: 800,  intensity: 'medium' },
  { center: [18.4530, 73.8626] as [number,number], radius: 700,  intensity: 'low'    },
  { center: [18.5975, 73.7618] as [number,number], radius: 600,  intensity: 'low'    },
  { center: [18.5581, 73.8074] as [number,number], radius: 750,  intensity: 'low'    },
];

const INTENSITY_STYLE: Record<string, { color: string; fillOpacity: number; weight: number }> = {
  high:   { color: '#ef4444', fillOpacity: 0.18, weight: 0 },
  medium: { color: '#f59e0b', fillOpacity: 0.14, weight: 0 },
  low:    { color: '#22c55e', fillOpacity: 0.12, weight: 0 },
};

const PRIORITY_COLOR: Record<string, string> = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#22c55e',
};

function MapStyler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.background = '#0d1117';
  }, [map]);
  return null;
}

interface Issue {
  id: string; title: string; location: string;
  priority: 'High' | 'Medium' | 'Low'; status: string; department: string;
}

export default function AdminHeatMap({ issues }: { issues: Issue[] }) {
  return (
    <MapContainer
      center={[18.5204, 73.8567]}
      zoom={12}
      style={{ width: '100%', height: '100%', background: '#0d1117' }}
      zoomControl={true}
      scrollWheelZoom={false}>

      <MapStyler />

      {/* Dark tile layer */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />

      {/* Heatmap background circles */}
      {HOTSPOTS.map((h, i) => {
        const style = INTENSITY_STYLE[h.intensity];
        return (
          <CircleMarker key={`heat-${i}`}
            center={h.center}
            radius={h.radius / 100}
            pathOptions={{
              color: style.color,
              fillColor: style.color,
              fillOpacity: style.fillOpacity,
              weight: style.weight,
              opacity: 0,
            }}
          />
        );
      })}

      {/* Individual issue markers */}
      {issues.map(issue => {
        const coords = LOCATION_COORDS[issue.location];
        if (!coords) return null;
        const color = PRIORITY_COLOR[issue.priority] ?? '#7a9ab0';

        return (
          <CircleMarker key={issue.id}
            center={coords}
            radius={7}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: 2,
            }}>
            <Tooltip>
              <div style={{ background: '#131B23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', color: 'white', fontSize: 12, minWidth: 160 }}>
                <p style={{ fontWeight: 600 }}>{issue.title}</p>
                <p style={{ color: '#7a9ab0', marginTop: 2 }}>📍 {issue.location}</p>
                <p style={{ color: '#7a9ab0', marginTop: 1 }}>🏢 {issue.department}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ color, fontWeight: 700, fontSize: 10 }}>● {issue.priority}</span>
                  <span style={{ color: '#4a6070', fontSize: 10 }}>{issue.status}</span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}