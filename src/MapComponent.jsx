import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { Activity, ShieldCheck, HeartPulse, User, Waves, Globe } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// 1. Perbaikan Default Icon (Penting agar tidak error/hilang)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 14, { duration: 2 });
    }
  }, [center, map]);
  return null;
}

const MapComponent = ({ reports, selectedReportPosition, showSafeZones, safeZones, userLocation }) => {

  // 2. Perbaikan Custom Icon: Menambahkan iconAnchor agar ujung lancip marker tepat di koordinat
  const createIcon = (iconComponent, color) => L.divIcon({
    html: `<div style="
            background: white; 
            border: 2px solid ${color}; 
            border-radius: 50%; 
            width: 36px; 
            height: 36px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="color: ${color};">${ReactDOMServer.renderToString(iconComponent)}</div>
            <div style="
              position: absolute;
              bottom: -6px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid white;
            "></div>
          </div>`,
    className: '',
    iconSize: [36, 42],     // Ukuran wadah icon
    iconAnchor: [18, 42],    // Titik tumpu (setengah lebar, seluruh tinggi) agar presisi
    popupAnchor: [0, -42]    // Posisi popup relatif terhadap icon
  });

  return (
    <MapContainer center={[-6.9147, 107.6098]} zoom={12} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController center={selectedReportPosition} />

      {/* Circle Radius Bencana */}
      {reports.filter(r => r.source === 'BMKG').map((r, i) => (
        <Circle
          key={`risk-radius-${i}`}
          center={r.position}
          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1 }}
          radius={50000}
        />
      ))}

      {/* 3. Perbaikan Marker User: Pastikan userLocation valid */}
      {userLocation && Array.isArray(userLocation) && userLocation.length === 2 && (
        <Marker
          position={userLocation}
          icon={createIcon(<User size={20} />, '#3b82f6')}
        >
          <Popup>
            <div className="text-center font-sans">
              <p className="font-black text-[10px] text-blue-600 uppercase">Posisi Anda</p>
              <p className="text-[9px] text-slate-500 font-bold">${userLocation[0].toFixed(5)}, ${userLocation[1].toFixed(5)}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Marker Laporan Bencana */}
      {reports.map((r, i) => {
        if (!r.position) return null;

        // Tentukan warna dan icon berdasarkan jenis bencana
        let markerColor = '#ef4444'; // Default Merah (e.g., Gempa, Kebakaran)
        let IconComponent = <Waves size={18} />;

        if (r.source === 'BMKG') {
          IconComponent = <Activity size={18} />;
        } else if (r.source === 'GDACS') {
          IconComponent = <Globe size={18} />;
          if (r.statusColor.includes('red')) markerColor = '#dc2626';
          else if (r.statusColor.includes('orange') || r.statusColor.includes('yellow')) markerColor = '#f97316';
          else if (r.statusColor.includes('green')) markerColor = '#22c55e';
          else if (r.statusColor.includes('blue')) markerColor = '#3b82f6';
        } else if (r.type === 'Banjir') {
          markerColor = '#3b82f6'; // Biru untuk Banjir
          IconComponent = <Waves size={18} />;
        } else if (r.type === 'Kebakaran' || r.type === 'Gunung Api') {
          markerColor = '#ea580c'; // Oranye tua
        } else if (r.type === 'Angin Kencang') {
          markerColor = '#64748b'; // Slate/Abu-abu
        }

        return (
          <Marker
            key={`report-${i}`}
            position={r.position}
            icon={createIcon(IconComponent, markerColor)}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-black text-xs uppercase" style={{ color: markerColor }}>{r.type}</h4>
                <p className="text-[10px] text-slate-500">{r.loc}</p>
                <p className="text-[9px] text-slate-400 mt-1 italic">{r.source}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Marker Titik Aman */}
      {showSafeZones && safeZones.map((zone) => (
        <Marker
          key={zone.id}
          position={zone.position}
          icon={createIcon(zone.type === "Kesehatan" ? <HeartPulse size={18} /> : <ShieldCheck size={18} />, '#10b981')}
        >
          <Popup>
            <div className="font-sans p-1">
              <h4 className="font-black text-xs text-green-600 uppercase">{zone.name}</h4>
              <p className="text-[9px] text-slate-500 font-bold mb-2">{zone.addr}</p>
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <p className="text-[8px]"><span className="font-bold">Faskes:</span> {zone.faskes}</p>
                <p className="text-[8px]"><span className="font-bold">Alt:</span> {zone.alt}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;