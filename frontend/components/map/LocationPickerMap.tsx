'use client';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CENTER: [number, number] = [18.5204, 73.8567];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

interface Props {
  coords: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({ coords, onPick }: Props) {
  return (
    <>
      <style>{`
        .leaflet-container { cursor: crosshair !important; }
        .location-picker-hint {
          position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
          background: rgba(19,27,35,0.9); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 4px 12px; font-size: 11px; color: #4a6070;
          pointer-events: none; white-space: nowrap; z-index: 500;
        }
      `}</style>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapContainer
          center={coords ? [coords.lat, coords.lng] : CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; OSM &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onPick={onPick} />
          {coords && (
            <CircleMarker
              center={[coords.lat, coords.lng]}
              radius={10}
              pathOptions={{ color: '#2274A5', fillColor: '#2274A5', fillOpacity: 0.9, weight: 2 }}
            />
          )}
        </MapContainer>
        <div className="location-picker-hint">📍 Click to set location</div>
      </div>
    </>
  );
}