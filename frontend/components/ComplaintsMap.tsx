'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons broken in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const statusColors: any = {
  Pending: '🟡',
  InProgress: '🔵',
  Resolved: '🟢',
  Rejected: '🔴',
};

export default function ComplaintsMap({ complaints }: { complaints: any[] }) {
  const complaintsWithLocation = complaints.filter((c) => c.lat && c.lng);

  if (complaintsWithLocation.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center text-gray-400">
        <p className="text-4xl mb-2">🗺️</p>
        <p>No complaints with location data yet</p>
        <p className="text-sm mt-1">Submit a complaint with coordinates to see the map</p>
      </div>
    );
  }

  const center: [number, number] = [
    complaintsWithLocation[0].lat,
    complaintsWithLocation[0].lng,
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '400px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaintsWithLocation.map((c) => (
        <Marker key={c.id} position={[c.lat, c.lng]} icon={icon}>
          <Popup>
            <div className="p-1">
              <p className="font-bold text-sm">{c.title}</p>
              <p className="text-xs text-gray-500">{c.category}</p>
              <p className="text-xs mt-1">
                {statusColors[c.status]} {c.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}