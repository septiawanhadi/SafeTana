import React, { useEffect, useState, useCallback, useMemo } from 'react';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Perbaikan Default Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// ── Controllers ────────────────────────────────────────────────────────────────

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

// ── Helper: resolve colour from statusColor class string ───────────────────────
function resolveColor(statusColor = '', type = '') {
  const s = statusColor.toLowerCase();
  const t = type.toLowerCase();
  if (s.includes('error') || s.includes('red') || t.includes('gempa')) return '#EF4444';
  if (s.includes('orange') || s.includes('error-container')) return '#F97316';
  if (s.includes('yellow')) return '#EAB308';
  if (s.includes('success') || s.includes('emerald') || s.includes('green')) return '#22C55E';
  if (s.includes('primary')) return '#6366F1';
  if (s.includes('tertiary') || t.includes('banjir')) return '#3B82F6';
  if (s.includes('outline') || t.includes('kabut') || t.includes('haze')) return '#94A3B8';
  return '#F59E0B';
}

// ── Helper: icon symbol from type ─────────────────────────────────────────────
function iconForType(type = '') {
  const t = type.toLowerCase();
  if (t.includes('gempa')) return 'earthquake';
  if (t.includes('banjir')) return 'flood';
  if (t.includes('angin') || t.includes('wind') || t.includes('siklon')) return 'storm';
  if (t.includes('kebakaran') || t.includes('fire')) return 'local_fire_department';
  if (t.includes('gunung') || t.includes('vulkan') || t.includes('volcano')) return 'volcano';
  if (t.includes('longsor') || t.includes('landslide')) return 'landslide';
  if (t.includes('kekeringan') || t.includes('drought')) return 'water_loss';
  if (t.includes('kabut') || t.includes('haze')) return 'foggy';
  if (t.includes('tsunami')) return 'tsunami';
  return 'warning';
}

// ── Magnitude → radius mapping (km) ───────────────────────────────────────────
function magToRadius(mag) {
  const m = parseFloat(mag) || 0;
  if (m >= 7) return 300000;
  if (m >= 6) return 200000;
  if (m >= 5) return 100000;
  if (m >= 4) return 60000;
  return 40000;
}

// ── LAYER definitions ──────────────────────────────────────────────────────────
const LAYERS = [
  { id: 'BMKG', label: 'Gempa BMKG', icon: 'earthquake', color: '#EF4444' },
  { id: 'PetaBencana', label: 'Bencana Lokal', icon: 'flood', color: '#3B82F6' },
  { id: 'GDACS', label: 'GDACS Global', icon: 'public', color: '#F97316' },
  { id: 'safe', label: 'Titik Aman', icon: 'gpp_good', color: '#22C55E' },
];

// ── MapComponent ───────────────────────────────────────────────────────────────

const MapComponent = ({
  reports = [],
  selectedReportPosition,
  showSafeZones = true,
  safeZones = [],
  userLocation,
  mapScope = 'lokal',
  isInteractive = false,
}) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const [isAllZonesOpen, setIsAllZonesOpen] = useState(false);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({ BMKG: true, PetaBencana: true, GDACS: true, safe: true });

  const toggleLayer = useCallback((id) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ── Icon factories ────────────────────────────────────────────────────────

  const createHazardIcon = useCallback((color, type, magnitude) => {
    const symbol = iconForType(type);
    const mag = parseFloat(magnitude);
    const isStrong = !isNaN(mag) && mag >= 5.0;
    const size = isStrong ? 40 : 32;
    const pulse = isStrong ? `<div class="absolute inset-0 rounded-full animate-ping opacity-40" style="background-color:${color}"></div>` : '';
    return L.divIcon({
      html: `<div class="relative flex items-center justify-center" style="width:${size}px;height:${size}px">
               ${pulse}
               <div class="rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white z-10"
                    style="width:${size}px;height:${size}px;background-color:${color}">
                 <span class="material-symbols-outlined" style="font-size:${isStrong ? 20 : 15}px;font-variation-settings:'FILL' 1">${symbol}</span>
               </div>
             </div>`,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, []);

  const userIcon = useMemo(() => L.divIcon({
    html: `<div class="relative flex items-center justify-center">
             <div class="w-8 h-8 bg-cyan-400 rounded-full border-4 border-white shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10 flex items-center justify-center text-white">
               <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1">my_location</span>
             </div>
             <div class="absolute inset-0 bg-cyan-400/50 rounded-full animate-ping shadow-[0_0_30px_rgba(34,211,238,0.6)]"></div>
           </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }), []);

  const safeZoneIcon = useMemo(() => L.divIcon({
    html: `<div class="p-2 bg-[#00ff9d] text-slate-900 rounded-full border-[3px] border-white shadow-[0_0_25px_rgba(0,255,157,0.8)] flex items-center justify-center">
             <span class="material-symbols-outlined text-sm font-black" style="font-variation-settings:'FILL' 1">gpp_good</span>
           </div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }), []);

  // ── Filtered reports by active layers ────────────────────────────────────
  const visibleReports = useMemo(() =>
    reports.filter(r => activeLayers[r.source] && r.position?.length === 2 && !isNaN(r.position[0]) && !isNaN(r.position[1])),
    [reports, activeLayers]
  );

  const bmkgReports = useMemo(() =>
    visibleReports.filter(r => r.source === 'BMKG'),
    [visibleReports]
  );

  const sourceSummary = useMemo(() => {
    const counts = {};
    reports.forEach(r => { counts[r.source] = (counts[r.source] || 0) + 1; });
    return counts;
  }, [reports]);

  return (
    <div className={`relative w-full h-full bg-surface-container-lowest ${isInteractive ? 'h-screen' : ''}`}>

      {/* ── Side Action Buttons ─────────────────────────────────────────── */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-6 z-[500] flex flex-col gap-3">
        <button
          onClick={() => userLocation && mapInstance && mapInstance.flyTo(userLocation, 16)}
          className="w-12 h-12 glass-card rounded-xl flex items-center justify-center text-[#00e5ff] border-[#00e5ff]/30 shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:bg-[#00e5ff]/20 active:scale-90 transition-all"
          title="Lokasi Saya"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>

        {isInteractive && (
          <>
            {/* Layer toggle button */}
            <button
              onClick={() => setIsLayerPanelOpen(p => !p)}
              className={`w-12 h-12 glass-card rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isLayerPanelOpen ? 'text-primary bg-primary/10' : 'text-slate-400 opacity-70'}`}
              title="Filter Lapisan"
            >
              <span className="material-symbols-outlined">layers</span>
            </button>

            {/* Panel visibility toggle */}
            <button
              onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
              className={`w-12 h-12 glass-card rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isBottomSheetOpen ? 'text-primary' : 'text-slate-400 opacity-70'}`}
              title="Sembunyikan Panel"
            >
              <span className="material-symbols-outlined">{isBottomSheetOpen ? 'visibility_off' : 'visibility'}</span>
            </button>
          </>
        )}
      </div>

      {/* ── Layer Filter Panel ──────────────────────────────────────────── */}
      {isInteractive && isLayerPanelOpen && (
        <div className="absolute top-20 right-20 sm:top-24 sm:right-[4.5rem] z-[501] glass-card rounded-2xl p-4 min-w-[200px] shadow-2xl border border-white/10 animate-in slide-in-from-right-4 duration-200">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-50 mb-3">Filter Lapisan</p>
          <div className="space-y-2">
            {LAYERS.map(layer => (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeLayers[layer.id] ? 'bg-white/5' : 'opacity-40'}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: layer.color + '20', border: `1px solid ${layer.color}40` }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: layer.color, fontVariationSettings: "'FILL' 1" }}>{layer.icon}</span>
                </div>
                <span className="font-bold text-xs text-on-surface text-left flex-1">{layer.label}</span>
                <span className="text-[9px] font-black text-on-surface-variant opacity-40">
                  {layer.id === 'safe' ? safeZones.length : (sourceSummary[layer.id] || 0)}
                </span>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${activeLayers[layer.id] ? 'border-primary bg-primary' : 'border-white/20 bg-transparent'}`}>
                  {activeLayers[layer.id] && <span className="material-symbols-outlined text-white" style={{ fontSize: 10 }}>check</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-on-surface-variant opacity-50 font-bold space-y-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/30" /> Magnitudo ≥5.0 (besar)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 ml-0.5" /> Magnitudo &lt;5.0</div>
          </div>
        </div>
      )}

      {/* ── Leaflet Map ─────────────────────────────────────────────────── */}
      <MapContainer
        center={[-6.9147, 107.6098]}
        zoom={12}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        zoomControl={false}
        ref={setMapInstance}
        className="h-full w-full z-0 grayscale-[0.6] brightness-[0.5] contrast-[1.1]"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          noWrap={true}
        />
        <MapController center={selectedReportPosition} />
        <MapScopeController mapScope={mapScope} />

        {/* User Location */}
        {userLocation && <Marker position={userLocation} icon={userIcon} />}

        {/* Earthquake Radius Circles (magnitude-scaled) */}
        {bmkgReports.map((r, i) => {
          const mag = parseFloat(r.type?.match(/[\d.]+/)?.[0]);
          return (
            <Circle
              key={`eq-radius-${i}`}
              center={r.position}
              pathOptions={{
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: !isNaN(mag) && mag >= 6 ? 0.12 : 0.06,
                weight: !isNaN(mag) && mag >= 5 ? 1.5 : 0.8,
                dashArray: '6 4',
              }}
              radius={!isNaN(mag) ? magToRadius(mag) : 50000}
            />
          );
        })}

        {/* Hazard Markers */}
        {visibleReports.map((r, i) => {
          const color = resolveColor(r.statusColor, r.type);
          const mag = r.type?.match(/[\d.]+/)?.[0];
          return (
            <Marker
              key={`hazard-${i}`}
              position={r.position}
              icon={createHazardIcon(color, r.type, mag)}
            >
              <Popup className="custom-popup" maxWidth={280}>
                <div className="font-headline p-1 min-w-[220px]">
                  {/* Source badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {r.source}
                    </span>
                    {mag && (
                      <span
                        className="font-black text-sm"
                        style={{ color }}
                      >
                        M{mag}
                      </span>
                    )}
                  </div>

                  {/* Type */}
                  <p className="font-black text-sm text-slate-800 dark:text-slate-100 leading-tight">{r.type}</p>

                  {/* Location */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">{r.loc}</p>

                  {/* Description */}
                  {r.desc && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 leading-relaxed">{r.desc}</p>
                  )}

                  {/* Depth / extra BMKG fields */}
                  {r.depth && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 12 }}>vertical_align_bottom</span>
                      <span className="text-[10px] text-slate-500 font-bold">Kedalaman: {r.depth}</span>
                    </div>
                  )}

                  {/* Time */}
                  {r.time && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 12 }}>schedule</span>
                      <span className="text-[10px] text-slate-500 font-bold">{r.time}</span>
                    </div>
                  )}

                  {/* Shakemap link */}
                  {r.shakemap && (
                    <a
                      href={`https://data.bmkg.go.id/DataMKG/TEWS/${r.shakemap}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-blue-500 hover:underline"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>map</span>
                      Lihat Shakemap
                    </a>
                  )}

                  {/* Coordinates */}
                  <p className="text-[9px] font-mono text-slate-400 mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                    {r.position[0].toFixed(4)}°, {r.position[1].toFixed(4)}°
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Safe Zones */}
        {showSafeZones && activeLayers.safe && safeZones.map((zone, i) => {
          if (!zone.position || zone.position.length !== 2 || isNaN(zone.position[0]) || isNaN(zone.position[1])) return null;
          return (
            <Marker key={`zone-${i}`} position={zone.position} icon={safeZoneIcon}>
              <Popup maxWidth={240}>
                <div className="font-headline p-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-full">Titik Evakuasi</span>
                  <p className="font-black text-sm text-slate-800 mt-2 leading-tight">{zone.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{zone.addr}</p>
                  {zone.capacity && (
                    <p className="text-[10px] text-slate-500 mt-1">Kapasitas: {zone.capacity}</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${zone.position[0]},${zone.position[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 flex items-center gap-1 text-[10px] font-black text-blue-500 hover:underline"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>directions</span>
                    Buka Rute
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Stats overlay (top-left) ─────────────────────────────────────── */}
      {isInteractive && (
        <div className="absolute top-24 left-4 z-[400] flex flex-col gap-2">
          {LAYERS.filter(l => l.id !== 'safe').map(layer => {
            const count = sourceSummary[layer.id] || 0;
            if (count === 0) return null;
            return (
              <div key={layer.id} className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg border border-white/5">
                <span className="material-symbols-outlined text-sm" style={{ color: layer.color, fontVariationSettings: "'FILL' 1" }}>{layer.icon}</span>
                <span className="font-black text-xs text-on-surface">{count}</span>
                <span className="text-[9px] text-on-surface-variant opacity-50 font-bold">{layer.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom Sheet: Nearby Events ─────────────────────────────────── */}
      {isInteractive && (
        <section
          className={`absolute bottom-0 w-full bg-surface-container-low/80 backdrop-blur-2xl rounded-t-[32px] border-t border-outline-variant/15 z-[400] pb-28 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mt-3 mb-5" />
          <div className="px-4 sm:px-6 space-y-5">

            {/* Active events summary */}
            {reports.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <h2 className="font-display text-2xl text-on-surface leading-none mb-1 tracking-tight">Kejadian Aktif</h2>
                    <p className="text-slate-400 text-sm font-medium">{reports.length} kejadian terdata dari {Object.keys(sourceSummary).length} sumber</p>
                  </div>
                  <button
                    onClick={() => setIsLayerPanelOpen(p => !p)}
                    className={`text-primary font-black text-xs tracking-widest uppercase hover:underline active:scale-95 transition-all flex items-center gap-1 ${isLayerPanelOpen ? 'opacity-100' : 'opacity-60'}`}
                  >
                    <span className="material-symbols-outlined text-sm">layers</span>
                    FILTER
                  </button>
                </div>

                {/* Disaster event cards horizontal scroll */}
                <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6">
                  {reports.slice(0, 12).map((r, idx) => {
                    const color = resolveColor(r.statusColor, r.type);
                    const mag = r.type?.match(/[\d.]+/)?.[0];
                    return (
                      <button
                        key={idx}
                        className="min-w-[220px] bg-surface-container-highest/40 rounded-2xl p-4 border border-outline-variant/10 text-left flex flex-col gap-2 active:scale-95 transition-transform hover:bg-surface-container-highest/60"
                        onClick={() => {
                          if (mapInstance && r.position) {
                            mapInstance.flyTo(r.position, 9, { duration: 1.2 });
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: color + '20', color }}
                          >
                            {r.source}
                          </span>
                          {mag && <span className="font-display font-black text-sm" style={{ color }}>M{mag}</span>}
                        </div>
                        <div>
                          <p className="font-headline font-black text-sm text-on-surface leading-tight">{r.type}</p>
                          <p className="text-slate-400 text-xs mt-0.5 leading-snug line-clamp-2">{r.loc}</p>
                        </div>
                        {r.desc && (
                          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 border-t border-white/5 pt-2">{r.desc}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Titik Evakuasi strip */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline font-black text-base text-on-surface">Titik Evakuasi Terdekat</h3>
                <button
                  onClick={() => setIsAllZonesOpen(true)}
                  className="text-primary font-black text-xs tracking-widest uppercase hover:underline active:scale-95 transition-all"
                >
                  LIHAT SEMUA
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6">
                {safeZones.slice(0, 5).map((zone, idx) => (
                  <div key={idx} className="min-w-[240px] bg-surface-container-highest/40 rounded-2xl p-4 border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-tertiary/10 rounded-xl">
                        <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                      </div>
                      <span className="bg-tertiary/20 text-tertiary text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Aman</span>
                    </div>
                    <h4 className="font-headline font-black text-sm text-on-surface tracking-tight leading-tight">{zone.name}</h4>
                    <p className="text-slate-400 text-xs font-medium mt-1 mb-3 line-clamp-1">{zone.addr}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${zone.position[0]},${zone.position[1]}`, '_blank')}
                        className="flex-1 bg-primary text-white font-headline font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-primary/20"
                      >
                        Rute
                      </button>
                      <button
                        onClick={() => window.location.href = `tel:${zone.phone || '112'}`}
                        className="w-10 h-10 bg-surface-container-highest rounded-xl border border-outline-variant/20 text-on-surface active:scale-90 transition-transform flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-lg">call</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Modal Semua Titik Evakuasi ───────────────────────────────────── */}
      {isAllZonesOpen && (
        <div className="absolute inset-0 z-[600] bg-surface-container-lowest/95 backdrop-blur-3xl overflow-y-auto w-full h-full flex flex-col p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6 mt-2 sticky top-0 bg-surface-container-lowest/90 backdrop-blur-md pt-2 pb-4 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div>
              <h2 className="font-display text-2xl font-black text-on-surface tracking-tight leading-none mb-1">Semua Titik Evakuasi</h2>
              <p className="text-slate-400 text-sm font-medium">{safeZones.length} lokasi terverifikasi</p>
            </div>
            <button onClick={() => setIsAllZonesOpen(false)} className="w-10 h-10 bg-surface-container-highest rounded-full flex items-center justify-center text-on-surface active:scale-90 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-24">
            {safeZones.map((zone, idx) => (
              <div key={idx} className="bg-surface-container-highest/40 rounded-2xl p-5 border border-outline-variant/10 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-tertiary/10 rounded-xl">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
                  </div>
                  <span className="bg-tertiary/20 text-tertiary text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Aman</span>
                </div>
                <h3 className="font-headline font-black text-base text-on-surface tracking-tight mb-1">{zone.name}</h3>
                <p className="text-slate-400 text-xs font-medium mb-4 flex-1">{zone.addr}</p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => { setIsAllZonesOpen(false); mapInstance?.flyTo(zone.position, 16); }}
                    className="flex-1 bg-surface-container-highest text-on-surface font-headline font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform border border-outline-variant/20"
                  >
                    Lihat Peta
                  </button>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${zone.position[0]},${zone.position[1]}`, '_blank')}
                    className="flex-1 bg-primary text-white font-headline font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-primary/30"
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