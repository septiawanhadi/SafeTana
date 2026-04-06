import React, { useEffect, useState, useCallback } from 'react';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import 'leaflet/dist/leaflet.css';

// Perbaikan Default Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { animate: true, duration: 2 });
    }
  }, [center, map]);
  return null;
};

const MapScopeController = ({ mapScope }) => {
  const map = useMap();
  useEffect(() => {
    if (mapScope === 'lokal') {
      map.flyTo([-6.9147, 107.6098], 12, { duration: 1.5 });
    } else if (mapScope === 'nasional') {
      map.flyTo([-2.5489, 118.0149], 5, { duration: 1.5 });
    }
  }, [mapScope, map]);
  return null;
};

const MapComponent = ({ reports = [], selectedReportPosition, showSafeZones = true, safeZones = [], userLocation, mapScope = 'lokal', isInteractive = false }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [isAllZonesOpen, setIsAllZonesOpen] = useState(false);

  // --- Memoized Icon Generators (v3.1) ---
  const createHazardIcon = useCallback((colorHex, type) => {
    let symbol = 'warning';
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('gempa')) symbol = 'e-bike_class_speed_moped';
    else if (lowerType.includes('banjir')) symbol = 'flood';
    else if (lowerType.includes('angin')) symbol = 'air';
    else if (lowerType.includes('kebakaran')) symbol = 'local_fire_department';
    else if (lowerType.includes('gunung')) symbol = 'volcano';

    return L.divIcon({
      html: `<div class="relative group flex items-center justify-center">
              <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white" style="background-color: ${colorHex}">
                 <span class="material-symbols-outlined" style="font-size: 16px;">${symbol}</span>
              </div>
              <div class="absolute inset-0 rounded-full animate-ping opacity-50" style="background-color: ${colorHex}"></div>
            </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, []);

  const userIcon = React.useMemo(() => L.divIcon({
    html: `<div class="relative flex items-center justify-center">
            <div class="w-8 h-8 bg-cyan-400 rounded-full border-4 border-white shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10 flex items-center justify-center text-white">
              <span class="material-symbols-outlined" style="font-size: 14px; font-weight: bold;">accessibility_new</span>
            </div>
            <div class="absolute inset-0 bg-cyan-400/50 rounded-full animate-ping shadow-[0_0_30px_rgba(34,211,238,0.6)]"></div>
          </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  const safeZoneIcon = React.useMemo(() => L.divIcon({
    html: `<div class="p-2 bg-[#00ff9d] text-slate-900 rounded-full border-[3px] border-white shadow-[0_0_25px_rgba(0,255,157,0.8)] flex items-center justify-center transform hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-sm font-black" style="font-weight: 900;">gpp_good</span>
          </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }), []);

  return (
    <div className={`relative w-full h-full bg-surface-container-lowest ${isInteractive ? 'h-screen' : ''}`}>

      {/* Side Actions */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-6 z-[500] flex flex-col gap-3">
        <button 
          onClick={() => userLocation && mapInstance && mapInstance.flyTo(userLocation, 16)}
          className="w-12 h-12 glass-card rounded-xl flex items-center justify-center text-[#00e5ff] font-bold border-[#00e5ff]/30 shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:bg-[#00e5ff]/20 active:scale-90 transition-all z-10"
          title="Recenter"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>
        {isInteractive && (
          <button 
            onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
            className={`w-12 h-12 glass-card rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isBottomSheetOpen ? 'text-primary' : 'text-slate-400 opacity-70'}`}
            title="Sembunyikan/Tampilkan Panel"
          >
            <span className="material-symbols-outlined">
              {isBottomSheetOpen ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>

      {/* Map Container */}
      <MapContainer 
        center={[-6.9147, 107.6098]} 
        zoom={12} 
        zoomControl={false}
        ref={setMapInstance}
        className="h-full w-full z-0 grayscale-[0.6] brightness-[0.5] contrast-[1.1]"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController center={selectedReportPosition} />
        <MapScopeController mapScope={mapScope} />

        {/* User Location */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} />
        )}

        {/* BMKG Disaster Radius */}
        {reports.filter(r => r.source === 'BMKG').map((r, i) => (
          <Circle
            key={`risk-radius-${i}`}
            center={r.position}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1 }}
            radius={50000}
          />
        ))}

        {/* Hazards (Optimized Rendering) */}
        {React.useMemo(() => reports.map((r, i) => {
          if (!r.position || r.position.length !== 2 || isNaN(r.position[0]) || isNaN(r.position[1])) return null;
          
          const color = (r.statusColor || '').includes('red') || (r.statusColor || '').includes('error') ? '#DC2626' : 
                        (r.statusColor || '').includes('tertiary') ? '#14b8a6' : '#F59E0B';
          
          return (
            <Marker 
              key={`hazard-${i}`} 
              position={r.position} 
              icon={createHazardIcon(color, r.type)}
            >
              <Popup className="custom-popup">
                <div className="p-2 font-headline">
                  <p className="text-[10px] font-black uppercase text-error tracking-widest">{r.type}</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{r.loc}</p>
                </div>
              </Popup>
            </Marker>
          );
        }), [reports, createHazardIcon])}

        {/* Safe Zones Markers (Optimized Rendering) */}
        {showSafeZones && React.useMemo(() => safeZones.map((zone, i) => {
          if (!zone.position || zone.position.length !== 2 || isNaN(zone.position[0]) || isNaN(zone.position[1])) return null;
          
          return (
            <Marker 
              key={`zone-${i}`} 
              position={zone.position}
              icon={safeZoneIcon}
            >
              <Popup>
                <div className="p-2 font-headline">
                  <p className="text-[10px] font-black uppercase text-tertiary tracking-widest">Titik Aman</p>
                  <p className="text-xs font-bold text-on-surface mt-1">{zone.name}</p>
                </div>
              </Popup>
            </Marker>
          );
        }), [safeZones, showSafeZones, safeZoneIcon])}
      </MapContainer>

      {/* Bottom Sheet: Nearby Safe Zones (Only if interactive) */}
      {isInteractive && (
        <section className={`absolute bottom-0 w-full bg-surface-container-low/80 backdrop-blur-2xl rounded-t-[32px] border-t border-outline-variant/15 z-[400] pb-28 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mt-3 mb-6"></div>
          <div className="px-4 sm:px-6 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl text-on-surface leading-none mb-1 tracking-tight">Titik Evakuasi Terdekat</h2>
                <p className="text-slate-400 text-sm font-medium">{safeZones.length} lokasi terverifikasi aktif</p>
              </div>
              <button 
                onClick={() => setIsAllZonesOpen(true)}
                className="text-primary font-black text-xs tracking-widest uppercase hover:underline active:scale-95 transition-all"
              >
                LIHAT SEMUA
              </button>
            </div>

            {/* Safe Zone Bento Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6">
              {safeZones.slice(0, 5).map((zone, idx) => (
                <div key={idx} className="min-w-[280px] bg-surface-container-highest/40 rounded-lg p-5 border border-outline-variant/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-tertiary/10 rounded-xl">
                      <span className="material-symbols-outlined text-tertiary">health_and_safety</span>
                    </div>
                    <span className="bg-tertiary/20 text-tertiary text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Aman</span>
                  </div>
                  <h3 className="font-headline font-black text-lg text-on-surface tracking-tight">{zone.name}</h3>
                  <p className="text-slate-400 text-xs font-medium mb-4">{zone.addr.slice(0, 40)}...</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${zone.position[0]},${zone.position[1]}`, '_blank')}
                      className="flex-1 bg-primary text-white font-headline font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-xl shadow-primary/30"
                    >
                      Rute
                    </button>
                    <button 
                      onClick={() => window.location.href = `tel:${zone.phone || '112'}`}
                      className="w-12 h-12 bg-surface-container-highest rounded-xl border border-outline-variant/20 text-on-surface active:scale-90 transition-transform flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-xl">call</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal Semua Titik Evakuasi */}
      {isAllZonesOpen && (
        <div className="absolute inset-0 z-[600] bg-surface-container-lowest/95 backdrop-blur-3xl overflow-y-auto w-full h-full flex flex-col p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-8 mt-2 sm:mt-4 sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md pt-2 sm:pt-4 pb-4 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div>
              <h2 className="font-display text-2xl font-black text-on-surface tracking-tight leading-none mb-1">Semua Titik Evakuasi</h2>
              <p className="text-slate-400 text-sm font-medium">{safeZones.length} lokasi terverifikasi aktif</p>
            </div>
            <button 
              onClick={() => setIsAllZonesOpen(false)}
              className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface active:scale-90 transition-transform flex-shrink-0"
              title="Tutup"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-24">
            {safeZones.map((zone, idx) => (
              <div key={idx} className="bg-surface-container-highest/40 rounded-xl p-5 border border-outline-variant/10 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-tertiary/10 rounded-xl">
                    <span className="material-symbols-outlined text-tertiary">health_and_safety</span>
                  </div>
                  <span className="bg-tertiary/20 text-tertiary text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Aman</span>
                </div>
                <h3 className="font-headline font-black text-lg text-on-surface tracking-tight mb-1">{zone.name}</h3>
                <p className="text-slate-400 text-xs font-medium mb-4 flex-1">{zone.addr}</p>
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => {
                      setIsAllZonesOpen(false);
                      if (mapInstance && zone.position) {
                        mapInstance.flyTo(zone.position, 16);
                      }
                    }}
                    className="flex-1 bg-surface-container-highest text-on-surface font-headline font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform border border-outline-variant/20"
                  >
                    Lihat Peta
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${zone.position[0]},${zone.position[1]}`, '_blank')}
                    className="flex-1 bg-primary text-white font-headline font-black py-3 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-xl shadow-primary/30"
                  >
                    Rute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default React.memo(MapComponent);