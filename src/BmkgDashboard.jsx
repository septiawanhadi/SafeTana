import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchLatestEarthquake,
  fetchFeltEarthquakes,
  fetchLocalWeather,
  fetchLocalAqi,
  deriveEarlyWarnings,
  getWeatherInfo,
  getAqiInfo,
  windDirLabel,
  BANDUNG_LAT,
  BANDUNG_LON
} from './services/bmkgService';
import { hazardService } from './services/hazardService';
import { reverseGeocode } from './utils/geoUtils';

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shadow-inner flex-shrink-0">
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <div>
      <h2 className="font-display text-xl font-black text-on-surface tracking-tight leading-none">{title}</h2>
      {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-6 animate-pulse space-y-3">
    <div className="h-4 bg-white/10 rounded-full w-1/2" />
    <div className="h-8 bg-white/10 rounded-full w-3/4" />
    <div className="h-4 bg-white/10 rounded-full w-full" />
  </div>
);

// Early Warning Banner
const EarlyWarningBanner = memo(({ warnings }) => {
  if (!warnings || warnings.length === 0) return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-emerald-500/20">
      <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-xl flex-shrink-0">✅</div>
      <div>
        <p className="font-black text-sm text-emerald-400 uppercase tracking-wider">Kondisi Normal</p>
        <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">Tidak ada peringatan cuaca aktif saat ini</p>
      </div>
    </div>
  );

  const levelColors = {
    danger: { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300', tagLabel: 'BAHAYA' },
    warning: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300', tagLabel: 'PERINGATAN' },
    watch: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300', tagLabel: 'WASPADA' },
  };

  return (
    <div className="space-y-3">
      {warnings.map((w, i) => {
        const c = levelColors[w.level] || levelColors.watch;
        return (
          <div key={i} className={`glass-card rounded-2xl p-5 border ${c.border} ${c.bg} relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 blur-3xl ${c.bg} opacity-50`} />
            <div className="relative z-10 flex items-start gap-4">
              <div className="text-3xl mt-0.5 flex-shrink-0">{w.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`font-black text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${c.badge}`}>{c.tagLabel}</span>
                  {w.time && <span className="text-[9px] font-bold text-on-surface-variant opacity-50 uppercase">Mulai ~{w.time}</span>}
                </div>
                <p className={`font-headline font-black text-base ${c.text} leading-tight mb-1`}>{w.title}</p>
                <p className="text-xs text-on-surface-variant opacity-70 leading-relaxed">{w.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Latest Earthquake Hero Card
const EarthquakeHeroCard = memo(({ quake }) => {
  if (!quake) return <SkeletonCard />;
  const mag = parseFloat(quake.Magnitude);
  const isStrong = mag >= 5.0;
  const coords = quake.Coordinates?.split(',').map(Number) || [0, 0];

  return (
    <div className={`glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden ${isStrong ? 'border border-red-500/30' : 'border border-white/5'}`}>
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl ${isStrong ? 'bg-red-500/10' : 'bg-primary/5'}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-60">Gempa Terbaru</span>
            </div>
            <div className={`font-display text-6xl md:text-8xl font-black leading-none tracking-tighter mb-2 ${isStrong ? 'text-red-400' : 'text-on-surface'}`}>
              M{quake.Magnitude}
            </div>
            <p className="text-sm font-medium text-on-surface-variant opacity-80 max-w-md leading-relaxed">{quake.Wilayah}</p>
          </div>
          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-2 md:mt-0">
            <div className="glass-card rounded-xl p-3 flex-1 md:flex-none md:min-w-[140px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mb-1">Kedalaman</p>
              <p className="font-display font-black text-lg text-on-surface">{quake.Kedalaman}</p>
            </div>
            <div className="glass-card rounded-xl p-3 flex-1 md:flex-none">
              <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mb-1">Koordinat</p>
              <p className="font-mono font-bold text-sm text-on-surface">{coords[0].toFixed(2)}°, {coords[1].toFixed(2)}°</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-white/5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Tanggal</p>
            <p className="font-bold text-sm text-on-surface">{quake.Tanggal} — {quake.Jam}</p>
          </div>
          {quake.Dirasakan && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Dirasakan</p>
              <p className="font-bold text-sm text-on-surface">{quake.Dirasakan}</p>
            </div>
          )}
          {quake.Potensi && (
            <div className="ml-auto">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-0.5">Potensi</p>
              <p className="font-bold text-xs text-primary max-w-[200px] leading-tight">{quake.Potensi}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Earthquake List Row
const EarthquakeRow = memo(({ quake, index }) => {
  const mag = parseFloat(quake.Magnitude);
  const color = mag >= 6 ? 'text-red-400' : mag >= 5 ? 'text-orange-400' : mag >= 4 ? 'text-yellow-400' : 'text-emerald-400';
  return (
    <div className={`flex items-center gap-4 py-3 ${index !== 0 ? 'border-t border-white/5' : ''}`}>
      <div className={`font-display font-black text-xl w-14 text-right flex-shrink-0 ${color}`}>M{quake.Magnitude}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-on-surface truncate">{quake.Wilayah?.replace('Pusat gempa berada di ', '')}</p>
        <p className="text-[10px] text-on-surface-variant opacity-50 font-medium">{quake.Tanggal} · {quake.Jam} · {quake.Kedalaman}</p>
      </div>
      {quake.Dirasakan && (
        <div className="flex-shrink-0">
          <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-1 rounded-full uppercase tracking-wide">{quake.Dirasakan}</span>
        </div>
      )}
    </div>
  );
});

// AQI Widget
const AqiWidget = memo(({ aqi, pm25, pm10 }) => {
  const info = getAqiInfo(aqi);
  const aqiNum = Number(aqi);
  const pct = Math.min(aqiNum / 300, 1) * 100;

  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50 mb-1">Indeks Polusi Udara</p>
          <p className={`text-4xl font-display font-black ${info.color}`}>{aqi === '--' ? '--' : aqiNum}</p>
          <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${info.color}`}>{info.label}</p>
        </div>
        <div className={`w-16 h-16 rounded-2xl ${info.bg} flex items-center justify-center text-3xl shadow-inner`}>💨</div>
      </div>
      {aqi !== '--' && (
        <div className="space-y-2 mb-4">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: `hsl(${120 - aqiNum / 2.5}, 80%, 55%)` }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant opacity-60">{info.desc}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">PM2.5</p>
          <p className="font-display font-black text-base text-on-surface">{pm25 === '--' ? '--' : `${Number(pm25).toFixed(1)} µg`}</p>
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">PM10</p>
          <p className="font-display font-black text-base text-on-surface">{pm10 === '--' ? '--' : `${Number(pm10).toFixed(1)} µg`}</p>
        </div>
      </div>
    </div>
  );
});

// Weather Forecast Card (hourly)
const ForecastCard = memo(({ f, isFirst }) => {
  const localDate = new Date(f.local_datetime || f.datetime);
  const hour = localDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const weatherInfo = getWeatherInfo(f.weather);

  return (
    <div className={`flex-shrink-0 glass-card rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[100px] transition-all ${isFirst ? 'border border-primary/30 bg-primary/5' : ''}`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-50">{hour}</p>
      <div className="text-3xl">{weatherInfo.emoji}</div>
      <p className="font-display font-black text-2xl text-on-surface">{f.t}°</p>
      <p className="text-[9px] text-on-surface-variant text-center opacity-60 leading-tight font-medium">{weatherInfo.label}</p>
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[9px] opacity-40">💧</span>
        <span className="text-[9px] font-bold opacity-50">{f.hu}%</span>
      </div>
    </div>
  );
});

// Bandung Flood Local Report Card - Redesigned for PREMIUM feel
const FloodCard = memo(({ report, onViewOnMap }) => {
  const isDanger = report.severity === 'danger' || report.severity === 'evacuation';
  const isWarning = report.severity === 'warning' || report.severity === 'alert';
  
  let statusLabel = 'Terdata';
  let statusColor = 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  let glowColor = 'shadow-sky-500/5';

  if (isDanger) {
    statusLabel = 'BAHAYA';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    glowColor = 'shadow-rose-500/20';
  } else if (isWarning) {
    statusLabel = 'WASPADA';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    glowColor = 'shadow-amber-500/10';
  }

  return (
    <div className={`glass-card rounded-[24px] p-6 border border-white/5 flex flex-col h-full relative overflow-hidden group transition-all duration-300 hover:border-white/20 ${glowColor} hover:shadow-2xl`}>
      {/* Background Decorative Element */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-opacity group-hover:opacity-40 ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-primary'}`} />
      
      <div className="relative z-10 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg border ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-tight">{report.time}</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
             <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>water_damage</span>
             <h4 className="font-headline font-black text-base text-on-surface tracking-tight truncate">{report.type}</h4>
          </div>
          <p className="text-xs font-bold text-on-surface-variant opacity-80 leading-snug line-clamp-1">{report.loc}</p>
        </div>

        <p className="text-[11px] text-on-surface-variant opacity-60 leading-relaxed line-clamp-2 italic mb-6">
          "{report.desc}"
        </p>
      </div>

      <div className="relative z-10 flex gap-2">
        <button 
          onClick={() => onViewOnMap(report.position)}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 border border-white/5 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">map</span>
          Peta
        </button>
        <a 
          href={report.url} 
          target="_blank" 
          rel="noreferrer"
          className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center transition-all hover:brightness-110 active:scale-90 shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">open_in_new</span>
        </a>
      </div>
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────────

const BmkgDashboard = () => {
  const navigate = useNavigate();

  const [latestQuake, setLatestQuake] = useState(null);
  const [feltQuakes, setFeltQuakes] = useState([]);
  const [bandungWeather, setBandungWeather] = useState(null);
  const [aqi, setAqi] = useState({ aqi: '--', pm25: '--', pm10: '--' });
  const [bandungFloods, setBandungFloods] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLoc, setUserLoc] = useState({ lat: BANDUNG_LAT, lon: BANDUNG_LON, name: 'Bandung' });

  const loadData = useCallback(async (signal, coords) => {
    setLoading(true);
    setError(null);
    try {
      const { lat, lon } = coords;
      const [quake, quakes, weather, aqiData, floods] = await Promise.allSettled([
        fetchLatestEarthquake(signal),
        fetchFeltEarthquakes(signal),
        fetchLocalWeather(lat, lon, signal),
        fetchLocalAqi(lat, lon, signal),
        hazardService.fetchLocalFloods(lat, lon, signal),
      ]);

      if (quake.status === 'fulfilled') setLatestQuake(quake.value);
      if (quakes.status === 'fulfilled') setFeltQuakes(quakes.value);
      if (weather.status === 'fulfilled') {
        setBandungWeather(weather.value);
        const warns = deriveEarlyWarnings(weather.value.forecasts || []);
        setWarnings(warns);
      }
      if (aqiData.status === 'fulfilled') setAqi(aqiData.value);
      if (floods.status === 'fulfilled') setBandungFloods(floods.value);

      setLastUpdated(new Date());
    } catch (e) {
      if (e.name !== 'AbortError') setError('Gagal memuat sebagian data. Menampilkan data yang tersedia.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let currentCoords = { lat: BANDUNG_LAT, lon: BANDUNG_LON, name: 'Bandung' };

    const init = async () => {
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const geoName = await reverseGeocode(lat, lon);
          currentCoords = { lat, lon, name: geoName || 'Lokasi Anda' };
          setUserLoc(currentCoords);
        } catch (error) {
          console.warn('Geolocation failed/blocked, using fallback.', error);
        }
      }
      loadData(controller.signal, currentCoords);
    };

    init();

    const interval = setInterval(() => {
      loadData(controller.signal, currentCoords);
    }, 180000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadData]);

  const currentForecast = bandungWeather?.forecasts?.[0];
  const currentWeather = currentForecast ? getWeatherInfo(currentForecast.weather) : null;
  const next12Hours = bandungWeather?.forecasts?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-background pb-32 pt-20">
      {/* Background deco */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-sky-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 space-y-8">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-on-surface-variant opacity-60 hover:opacity-100 mb-3 transition-opacity text-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="font-bold">Kembali</span>
            </button>
            <h1 className="font-display text-3xl md:text-4xl font-black text-on-surface tracking-tighter">
              Cuaca &amp; Bencana
            </h1>
            <p className="text-sm text-on-surface-variant opacity-60 mt-1 font-medium">
              Informasi meteorologi &amp; geofisika real-time
            </p>
          </div>
          <button
            onClick={() => { const c = new AbortController(); loadData(c.signal, userLoc); }}
            disabled={loading}
            className="glass-card p-3 rounded-xl text-primary hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-40"
            title="Perbarui data"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <p className="text-[10px] text-on-surface-variant opacity-40 font-medium -mt-4">
            Diperbarui: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
          </p>
        )}

        {error && (
          <div className="glass-card border border-yellow-500/20 bg-yellow-500/5 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-400">warning</span>
            <p className="text-sm text-yellow-400 font-medium">{error}</p>
          </div>
        )}

        {/* ── SECTION 1: Peringatan Dini Cuaca ─────────────────────── */}
        <section>
          <SectionTitle icon="warning_amber" title="Peringatan Dini Cuaca" subtitle="Berdasarkan prakiraan terkini" />
          {loading ? <SkeletonCard /> : <EarlyWarningBanner warnings={warnings} />}
        </section>

        {/* ── SECTION 2: Gempa Bumi Terkini ───────────────────────── */}
        <section>
          <SectionTitle icon="earthquake" title="Gempa Bumi Terkini" subtitle="Data seismik terbaru" />
          {loading ? <SkeletonCard /> : <EarthquakeHeroCard quake={latestQuake} />}
        </section>

        {/* ── SECTION 3: Kualitas Udara + Daftar Gempa ─────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <SectionTitle icon="air" title="Kualitas Udara" subtitle="AQI & PM2.5 Regional" />
            {loading ? <SkeletonCard /> : <AqiWidget {...aqi} />}
          </div>
          <div className="md:col-span-7">
            <SectionTitle icon="format_list_bulleted" title="Daftar Gempa Dirasakan" subtitle="15 hari terakhir" />
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
            ) : (
              <div className="glass-card rounded-2xl p-5 divide-y divide-white/5">
                {feltQuakes.length === 0 ? (
                  <p className="text-sm text-on-surface-variant opacity-50 text-center py-6">Tidak ada data gempa</p>
                ) : feltQuakes.map((q, i) => <EarthquakeRow key={i} quake={q} index={i} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 4: Pantauan Banjir Bandung ───────────────────── */}
        <section className="relative">
          {/* Animated Background Deco */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40 animate-pulse" />
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-[10px] font-black text-rose-400 tracking-[0.2em] uppercase">LIVE REPORTS</span>
                </div>
                <div className="h-px w-12 bg-white/10 hidden sm:block" />
              </div>
              <SectionTitle icon="flood" title="Pantauan Bencana Lokal" subtitle="Integrasi Real-time PetaBencana.id" />
            </div>
            
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              {[
                { label: 'Radius 30km', count: bandungFloods.length, icon: 'my_location', color: 'text-primary' },
                { label: 'Darurat', count: bandungFloods.filter(f => f.severity !== 'normal').length, icon: 'warning', color: 'text-orange-400' }
              ].map((stat, i) => (
                <div key={i} className="glass-card px-4 md:px-5 py-3 rounded-[20px] flex items-center justify-between lg:justify-start gap-4 border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative w-full">
                  <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10">
                    <p className="text-[8px] font-black text-on-surface-variant opacity-40 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                    <div className="flex items-center gap-3">
                      <span className={`font-display font-black text-2xl ${stat.color}`}>{stat.count}</span>
                      <span className={`material-symbols-outlined ${stat.color} opacity-20 text-xl group-hover:opacity-50 transition-opacity`}>{stat.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="flex gap-4 overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
               <div className="min-w-[280px]"><SkeletonCard /></div>
               <div className="min-w-[280px]"><SkeletonCard /></div>
            </div>
          ) : bandungFloods.length === 0 ? (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-tertiary/5 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="glass-card rounded-[40px] p-16 border border-white/10 text-center bg-white/[0.01] backdrop-blur-[40px] overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mt-32 animate-pulse" />
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-white/10 to-white/5 mx-auto mb-8 flex items-center justify-center text-5xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] border border-white/10 group-hover:scale-110 transition-transform duration-700">
                    <span className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">🌊</span>
                  </div>
                  <h3 className="font-display font-black text-3xl text-on-surface tracking-tight mb-4 capitalize">Kondisi Lokal Aman</h3>
                  <p className="text-sm md:text-base text-on-surface-variant opacity-50 max-w-md mx-auto leading-relaxed font-medium">
                    Tidak ditemukan laporan bencana aktif di sekitar lokasi Anda saat ini. Tetap waspada terhadap perubahan cuaca.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6">
              {bandungFloods.map((r, i) => (
                <div key={r.id || i} className="min-w-[280px] max-w-[320px] flex-shrink-0 first:ml-4 last:mr-4 sm:first:ml-0 sm:last:mr-0">
                  <FloodCard 
                    report={r} 
                    onViewOnMap={(pos) => navigate('/', { state: { focusCoords: pos } })}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 5: Regional Lokal ──────────────────────────── */}
        <section>
          {/* Section header with badge */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 shadow-inner flex-shrink-0">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-black text-on-surface tracking-tight leading-none">Cuaca Lokal</h2>
                <span className="text-[9px] font-black uppercase tracking-widest bg-sky-500/15 text-sky-400 px-2 py-0.5 rounded-full">📍 {userLoc.name}</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-50 mt-0.5">Informasi cuaca terkini untuk lokasi Anda</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <div className="space-y-5">
              {/* Current conditions hero */}
              {currentForecast && (
                <div className="glass-card rounded-2xl p-6 md:p-8 border border-sky-500/15 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl bg-sky-500/10" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                    {/* Main temp */}
                    <div className="flex items-center gap-5 md:gap-6">
                      <div className="text-6xl md:text-8xl">{currentWeather?.emoji}</div>
                      <div>
                        <div className="font-display text-6xl md:text-8xl font-black text-on-surface leading-none tracking-tighter">
                          {currentForecast.t}°
                        </div>
                        <div className="text-sm font-bold text-on-surface-variant opacity-70 mt-1">{currentWeather?.label}</div>
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                      {[
                        { icon: 'water_drop', label: 'Kelembaban', val: `${currentForecast.hu}%` },
                        { icon: 'air', label: 'Angin', val: `${currentForecast.ws} m/s ${windDirLabel(currentForecast.wd_deg)}` },
                        { icon: 'visibility', label: 'Visibilitas', val: currentForecast.vs_text },
                        { icon: 'umbrella', label: 'Curah Hujan', val: `${currentForecast.tp} mm` },
                      ].map(item => (
                        <div key={item.label} className="glass-card rounded-xl p-3">
                          <span className="material-symbols-outlined text-sm text-primary opacity-70">{item.icon}</span>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">{item.label}</p>
                          <p className="font-display font-black text-sm text-on-surface mt-0.5">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location info strip */}
                  <div className="relative z-10 mt-5 pt-5 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-on-surface-variant opacity-50 font-bold uppercase tracking-wider">
                    <span>📍 {userLoc.name}</span>
                    <span>📌 Radius Pantauan 30 KM</span>
                  </div>
                </div>
              )}

              {/* 8-Hour Forecast Scroller */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 mb-3">Prakiraan Per Jam</p>
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
                  {next12Hours.map((f, i) => (
                    <ForecastCard key={i} f={f} isFirst={i === 0} />
                  ))}
                </div>
              </div>

              {/* 3-day summary */}
              {bandungWeather?.forecasts && (() => {
                // Group by day
                const byDay = {};
                bandungWeather.forecasts.forEach(f => {
                  const localDate = new Date(f.local_datetime || f.datetime);
                  const dayKey = localDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
                  if (!byDay[dayKey]) byDay[dayKey] = [];
                  byDay[dayKey].push(f);
                });
                const days = Object.entries(byDay).slice(0, 4);
                return (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 mb-3">Prakiraan Harian</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {days.map(([day, hours]) => {
                        const temps = hours.map(h => h.t);
                        const minT = Math.min(...temps);
                        const maxT = Math.max(...temps);
                        const dominantWeather = hours.reduce((acc, h) => {
                          const info = getWeatherInfo(h.weather);
                          if (!acc || (info.severity === 'danger' || info.severity === 'warning')) return info;
                          return acc;
                        }, null);
                        return (
                          <div key={day} className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-center leading-tight">{day}</p>
                            <div className="text-3xl">{dominantWeather?.emoji}</div>
                            <p className="text-[10px] text-on-surface-variant opacity-60 text-center">{dominantWeather?.label}</p>
                            <div className="flex items-center gap-2 font-display font-black text-sm">
                              <span className="text-red-400">{maxT}°</span>
                              <span className="opacity-30">/</span>
                              <span className="text-sky-400">{minT}°</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>

        {/* ── Informational Footer ──────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5 flex items-start gap-4 border border-white/5">
          <span className="material-symbols-outlined text-on-surface-variant opacity-40 mt-0.5">info</span>
          <div className="text-[10px] text-on-surface-variant opacity-50 leading-relaxed font-medium">
            Data cuaca dan seismik diperbarui secara otomatis dari sumber resmi. Interval pembaruan: gempa (real-time), cuaca (3 jam), kualitas udara (1 jam).
            Peringatan dini dianalisis berdasarkan prakiraan cuaca terkini untuk wilayah Bandung Raya.
          </div>
        </div>

      </div>
    </div>
  );
};

export default BmkgDashboard;
