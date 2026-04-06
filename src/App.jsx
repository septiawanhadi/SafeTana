import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { calculateDistance, reverseGeocode } from './utils/geoUtils';
import { maskName, maskPhone } from './securityUtils';
import { playSiren, stopSiren } from './utils/audioUtils';
import { bandungSafeZones } from './data/safeZones';
import { kabBandungSafeZones } from './data/kabBandungSafeZones';

// Core Components
import MapComponent from './MapComponent';
import AiChatbot from './AiChatbot';
import NewsDashboard from './NewsDashboard';
import TopAppBar from './components/common/TopAppBar';
import BottomNavBar from './components/common/BottomNavBar';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import DynamicIsland from './components/common/DynamicIsland';

// Integration: Service Pattern
import { aiService } from './services/health/aiService';
import { dataService } from './services/health/dataService';
import { useDynamicIsland } from './contexts/DynamicIslandContext';

// Health Module Components
import HealthDashboard from './components/health/HealthDashboard';
import HealthAuth from './components/health/HealthAuth';
import HealthScreening from './components/health/HealthScreening';
import MoodTracker from './components/health/MoodTracker';
import HealthChatbot from './components/health/HealthChatbot';
import HealthDictionary from './components/health/HealthDictionary';
import HealthPrivacy from './components/health/HealthPrivacy';
import HealthTerms from './components/health/HealthTerms';
import HealthAbout from './components/health/HealthAbout';

// Legacy/Additional Modules
import CommandCenter from './CommandCenter';
import EducationDashboard from './EducationDashboard';
import AdminLogin from './AdminLogin';

// --- Memoized UI Components ---

const HeroStatus = memo(({ isSOS }) => (
  <section className={`p-8 rounded-lg glass-card relative overflow-hidden flex flex-col justify-end min-h-[220px] shadow-2xl transition-all duration-700 ${isSOS ? 'bg-error text-white' : 'bg-surface-container-highest'}`}>
    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse ${isSOS ? 'bg-white/20' : 'bg-primary/10'}`} />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${isSOS ? 'bg-white' : 'bg-success'} animate-pulse`} />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Protokol Keamanan Alpha</span>
      </div>
      <h2 className="font-display text-5xl md:text-7xl font-black leading-none tracking-tighter mb-4">
        {isSOS ? 'STATUS DARURAT AKTIF' : 'KONDISI AMAN'}
      </h2>
      <p className="text-sm font-medium opacity-80 max-w-lg leading-relaxed">
        {isSOS ? 'Ancaman bencana terdeteksi. Tim darurat disiagakan. Segera ikuti protokol evakuasi.' : 'Kondisi seismik dan cuaca aman.'}
      </p>
    </div>
  </section>
));

const StatCard = memo(({ label, value, unit, icon, color }) => (
  <div className="glass-card p-6 rounded-lg flex items-center gap-5 shadow-xl hover:translate-y-[-4px] transition-all duration-300">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color} bg-opacity-10 text-xl border border-current border-opacity-10 shadow-inner`}>
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
    </div>
    <div>
      <h4 className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest leading-none mb-1 opacity-60">{label}</h4>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-4xl font-black text-on-surface tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-on-surface-variant opacity-40">{unit}</span>
      </div>
    </div>
  </div>
));

const BroadcastBanner = memo(({ broadcast }) => {
  if (!broadcast) return null;
  return (
    <div className="bg-primary text-white p-4 rounded-lg flex items-center justify-between shadow-lg animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-white/10 animate-pulse" />
      <div className="flex items-center gap-4 relative z-10">
        <span className="material-symbols-outlined animate-bounce">campaign</span>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-70">Peringatan Darurat</span>
          <span className="text-sm font-headline font-bold leading-tight">{broadcast.message}</span>
        </div>
      </div>
      <span className="text-[10px] font-black opacity-50 relative z-10">LANGSUNG</span>
    </div>
  );
});

const App = () => {
  const navigate = useNavigate();
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [reports, setReports] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [latestBroadcast, setLatestBroadcast] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [safeZones, setSafeZones] = useState([...bandungSafeZones, ...kabBandungSafeZones]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [weatherData, setWeatherData] = useState({ aqi: '--', precipitation: '--' });
  
  const { showNotification, showReminder } = useDynamicIsland();

  // Splash & Onboarding Logic
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = sessionStorage.getItem('hasSeenOnboarding_v1');
    if (hasSeenOnboarding) {
      setShowSplash(false); // Skip splash if already seen in session
    }
  }, []);

  // --- Optimized Data Fetching (v2.1) ---
  const fetchHazards = useCallback(async (signal) => {
    const cachedReports = localStorage.getItem('safetana_reports_cache');
    const lastFetchTime = localStorage.getItem('safetana_last_fetch_time');
    const now = new Date().getTime();

    if (cachedReports && lastFetchTime && (now - parseInt(lastFetchTime, 10)) < 300000) {
      try {
        const parsed = JSON.parse(cachedReports).filter(r => r.source !== 'Dummy System');
        setReports(parsed);
        return;
      } catch (e) {
        console.error("Gagal membaca cache:", e);
      }
    } else if (cachedReports) {
      try {
        const parsed = JSON.parse(cachedReports).filter(r => r.source !== 'Dummy System');
        setReports(parsed);
      } catch (e) {
        console.error("Gagal membaca cache lama:", e);
      }
    }

    try {
      // 1. Fetch BMKG Earthquake Data
      const resBMKG = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json', { signal });
      const dataBMKG = await resBMKG.json();

      const bmkg = dataBMKG.Infogempa.gempa.slice(0, 5).map(item => ({
        source: 'BMKG',
        type: `Gempa M ${item.Magnitude}`,
        loc: item.Wilayah,
        position: item.Coordinates.split(',').map(Number),
        desc: `Skala MMI: ${item.Dirasakan || 'Belum diketahui'}`,
        statusColor: 'bg-error'
      }));

      // 2. Fetch PetaBencana API
      let petabencana = [];
      try {
        const resPB = await fetch('https://data.petabencana.id/reports?timeperiod=604800', { signal });
        const dataPB = await resPB.json();

        if (dataPB && dataPB.result && dataPB.result.features) {
          petabencana = dataPB.result.features.slice(0, 15).map(feature => {
            const props = feature.properties;
            const typeRaw = props.hazard_type || 'unknown';

            let typeMap = 'Bencana Bantuan';
            let colorMap = 'bg-tertiary';

            if (typeRaw === 'flood') { typeMap = 'Banjir'; colorMap = 'bg-primary'; }
            else if (typeRaw === 'earthquake') { typeMap = 'Gempa Bumi'; colorMap = 'bg-error'; }
            else if (typeRaw === 'wind') { typeMap = 'Angin Kencang'; colorMap = 'bg-surface-variant'; }
            else if (typeRaw === 'volcano') { typeMap = 'Gunung Api'; colorMap = 'bg-error-container'; }
            else if (typeRaw === 'fire') { typeMap = 'Kebakaran'; colorMap = 'bg-error'; }
            else if (typeRaw === 'haze') { typeMap = 'Kabut Asap'; colorMap = 'bg-outline'; }

            let locName = props.tags?.district || props.tags?.local_area || 'Wilayah Terdampak';
            const coords = feature.geometry.coordinates;
            const position = [coords[1], coords[0]];

            return {
              source: 'PetaBencana',
              type: typeMap,
              loc: maskName(locName),
              position: position,
              desc: maskName(props.tags?.description) || `Status: ${props.status} / Publik`,
              statusColor: colorMap
            };
          });
        }
      } catch (pbError) {
        if (pbError.name !== 'AbortError') console.warn("Gagal mengambil data PetaBencana:", pbError);
      }

      // 3. Fetch GDACS API
      let gdacsData = [];
      try {
        const resGDACS = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP', { signal });
        const dataGDACS = await resGDACS.json();
        if (dataGDACS && dataGDACS.features) {
          const idnEvents = dataGDACS.features.filter(f =>
            f.properties && f.properties.country && f.properties.country.toLowerCase().includes('indonesia')
          );

          gdacsData = await Promise.all(idnEvents.map(async feature => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;

            let typeMap = props.eventtype || 'EVENT';
            if (props.eventtype === 'EQ') typeMap = 'Gempa Bumi';
            else if (props.eventtype === 'TC') typeMap = 'Siklon Tropis';
            else if (props.eventtype === 'FL') typeMap = 'Banjir';
            else if (props.eventtype === 'VO') typeMap = 'Gunung Api';
            else if (props.eventtype === 'DR') typeMap = 'Kekeringan';
            else if (props.eventtype === 'WF') typeMap = 'Kebakaran Hutan';

            let colorMap = 'bg-surface-variant';
            if (props.alertlevel === 'Red') colorMap = 'bg-error';
            else if (props.alertlevel === 'Orange') colorMap = 'bg-error-container';
            else if (props.alertlevel === 'Green') colorMap = 'bg-success';

            let rawLoc = props.eventname || props.country;
            if (!rawLoc || rawLoc.trim().toLowerCase() === 'indonesia' || rawLoc.trim() === '') {
              const geoLoc = await reverseGeocode(coords[1], coords[0]);
              if (geoLoc) rawLoc = geoLoc;
              else rawLoc = 'Wilayah Terdampak (GDACS)';
            }

            return {
              source: 'GDACS',
              type: typeMap,
              loc: maskName(rawLoc),
              position: [coords[1], coords[0]],
              desc: maskName(props.description) || `Alert Level: ${props.alertlevel}`,
              statusColor: colorMap
            };
          }));
        }
      } catch (gdacsError) {
        if (gdacsError.name !== 'AbortError') console.warn("Gagal mengambil data GDACS:", gdacsError);
      }

      const combinedReports = [...bmkg, ...petabencana, ...gdacsData].filter(r => r.source !== 'Dummy System');
      setReports(combinedReports);

      localStorage.setItem('safetana_reports_cache', JSON.stringify(combinedReports));
      localStorage.setItem('safetana_last_fetch_time', new Date().getTime().toString());

    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error("API Global Error", e);
        if (!cachedReports) {
          setReports([
            {
              source: 'BPBD Jabar', type: 'Tanah Longsor', loc: 'Kec. Cililin, Kabupaten Bandung Barat',
              position: [-6.95, 107.46], desc: 'Jalan terputus, 15 KK dievakuasi',
              statusColor: 'bg-emerald-500'
            },
            {
               source: 'BMKG', type: 'Gempa M 5.2', loc: 'Kabupaten Bandung',
               position: [-7.16, 107.45], desc: 'Skala MMI: III',
               statusColor: 'bg-error'
            }
          ]);
        }
      }
    }
  }, []);

  const fetchRealtimeEnv = useCallback(async (lat, lon, signal) => {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    const PROXIES = [
      '', 
      'https://api.allorigins.win/raw?url=',
      'https://thingproxy.freeboard.io/fetch/',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://corsproxy.io/?'
    ];

    for (const proxy of PROXIES) {
      if (signal?.aborted) return;
      try {
        const fetchTarget = async (url) => {
          const finalUrl = proxy 
            ? proxy.includes('allorigins') ? `${proxy}${encodeURIComponent(url)}` : `${proxy}${url}`
            : url;

          const res = await fetch(finalUrl, { signal });
          if (!res.ok) throw new Error('Fetch failed');
          return await res.json();
        };

        const [wData, aData] = await Promise.all([
          fetchTarget(weatherUrl),
          fetchTarget(aqiUrl)
        ]);

        setWeatherData({
          precipitation: wData.current?.precipitation ?? 0,
          aqi: aData.current?.us_aqi ?? '--'
        });
        
        return; // Success!
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.warn(`Weather fetch failed via ${proxy || 'direct'}, trying next...`);
      }
    }

    setWeatherData({ precipitation: 0, aqi: '--' });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchHazards(controller.signal);

    const q_broadcast = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'), limit(1));
    const unsub_broadcast = onSnapshot(q_broadcast, (snap) => {
      if (!snap.empty) setLatestBroadcast(snap.docs[0].data());
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }

    return () => {
      unsub_broadcast();
      controller.abort();
    };
  }, [fetchHazards]);

  // Trigger Notification on New Broadcast (Memoized check)
  const lastBroadcastIdRef = useRef(null);
  useEffect(() => {
    if (latestBroadcast && latestBroadcast.timestamp?.seconds !== lastBroadcastIdRef.current) {
      lastBroadcastIdRef.current = latestBroadcast.timestamp?.seconds;
      showNotification({
        title: 'Peringatan Terbaru',
        description: latestBroadcast.message,
        icon: 'campaign',
        action: () => navigate('/')
      });
    }
  }, [latestBroadcast, navigate, showNotification]);

  // Trigger Journal Reminder after 1 minute of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      showReminder({
        title: 'Jurnal Harian',
        description: 'Bagaimana perasaanmu hari ini? Luapkan di jurnal.',
        icon: 'edit_note',
        action: () => navigate('/health/mood')
      });
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  // Fetch Realtime Weather & AQI based on userLocation
  useEffect(() => {
    if (!userLocation) return;
    const controller = new AbortController();
    fetchRealtimeEnv(userLocation[0], userLocation[1], controller.signal);
    return () => controller.abort();
  }, [userLocation, fetchRealtimeEnv]);

  const handleSOSClick = useCallback(async () => {
    const nextState = !isSOSActive;
    setIsSOSActive(nextState);
    
    if (nextState) {
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
      playSiren();
      
      const userId = localStorage.getItem('safetana_uid') || ('user_' + Math.random().toString(36).substr(2, 9));
      localStorage.setItem('safetana_uid', userId);
      
      setDoc(doc(db, 'active_users', userId), {
        name: "Warga Darurat",
        status: "Butuh Evakuasi",
        pos: userLocation || [-6.914744, 107.609810], 
        lastActive: serverTimestamp()
      }).catch(console.error);

    } else {
      stopSiren();
      
      const userId = localStorage.getItem('safetana_uid');
      if (userId) {
        setDoc(doc(db, 'active_users', userId), {
          name: "Warga",
          status: "Aman",
          pos: userLocation || [-6.914744, 107.609810],
          lastActive: serverTimestamp()
        }).catch(console.error);
      }
    }
    
    navigate('/');
  }, [isSOSActive, navigate, userLocation]);

  const DashboardContent = (
    <main className="pt-20 pb-32 px-4 md:pt-24 md:px-6 space-y-8 md:space-y-10 max-w-6xl mx-auto relative z-10">
      <BroadcastBanner broadcast={latestBroadcast} />
      
      <HeroStatus isSOS={isSOSActive} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard label="Kualitas Udara" value={weatherData.aqi} unit="AQI" icon="air" color="text-tertiary" />
        <StatCard label="Risiko Seismik" value="RENDAH" unit="lvl 0" icon="earthquake" color="text-error" />
        <StatCard label="Curah Hujan" value={weatherData.precipitation} unit="mm/h" icon="rainy" color="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div 
          className="lg:col-span-8 glass-card rounded-lg overflow-hidden h-[450px] group cursor-pointer shadow-2xl relative border-t border-outline-variant/10"
          onClick={() => navigate('/map')}
        >
          <div className="absolute top-8 left-8 z-10 pointer-events-none">
             <h4 className="font-display text-3xl text-on-surface leading-none mb-2">Monitor Bencana Regional</h4>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Pemetaan Area Terdampak</p>
          </div>
          <div className="w-full h-full grayscale brightness-[0.4] group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000">
             <MapComponent reports={reports} userLocation={userLocation} safeZones={safeZones} showSafeZones={true} />
          </div>
          <div className="absolute bottom-8 right-8">
            <div className="w-16 h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-3xl">explore</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-8">
          <button onClick={() => navigate('/health')} className="glass-card rounded-lg p-8 flex flex-col justify-between hover:bg-surface-container-highest transition-all group shadow-2xl border-b-4 border-tertiary/20 text-left">
             <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary shadow-inner group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>health_metrics</span>
             </div>
             <div className="text-left mt-4">
               <h3 className="font-headline font-black text-2xl text-on-surface tracking-tighter leading-none mb-1">Klinik Kesehatan</h3>
               <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Inteligensi Medis AI</p>
             </div>
          </button>
          
          <button onClick={() => setIsAiOpen(true)} className="relative glass-card rounded-lg p-8 flex flex-col justify-between hover:bg-primary/5 transition-all overflow-hidden group shadow-2xl border-b-4 border-primary/20 text-left">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:rotate-12 transition-transform">
               <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
             </div>
             <div className="text-left mt-4 z-10">
               <h3 className="font-headline font-black text-2xl text-on-surface tracking-tighter leading-none mb-1">Asisten Penjaga AI</h3>
               <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">Aktif 24/7</p>
             </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <button onClick={() => navigate('/news')} className="glass-card p-4 md:p-6 rounded-lg flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 hover:bg-surface-container-low transition-all shadow-lg text-center md:text-left group">
           <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-125 transition-transform">newspaper</span>
           <span className="font-headline font-black text-[10px] md:text-xs uppercase tracking-widest leading-none">Berita</span>
        </button>
        <button onClick={() => navigate('/education')} className="glass-card p-4 md:p-6 rounded-lg flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 hover:bg-surface-container-low transition-all shadow-lg text-center md:text-left group">
           <span className="material-symbols-outlined text-primary-fixed text-2xl group-hover:scale-125 transition-transform">school</span>
           <span className="font-headline font-black text-[10px] md:text-xs uppercase tracking-widest leading-none">Edukasi</span>
        </button>
        <button onClick={handleSOSClick} className={`col-span-2 md:col-span-2 px-6 py-4 md:px-8 md:py-6 rounded-lg flex items-center justify-center gap-4 md:gap-6 font-headline font-black text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl active:scale-95 transition-all ${isSOSActive ? 'bg-white text-error' : 'bg-error text-white pulse-red'}`}>
           <span className="material-symbols-outlined text-2xl md:text-3xl">sos</span>
           {isSOSActive ? 'NONAKTIFKAN SOS' : 'AKTIFKAN SOS'}
        </button>
      </div>
    </main>
  );

  if (showSplash) {
    return <SplashScreen onDone={() => {
      setShowSplash(false);
      const hasSeen = sessionStorage.getItem('hasSeenOnboarding_v1');
      if (!hasSeen) setShowOnboarding(true);
    }} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onDone={() => {
      setShowOnboarding(false);
      sessionStorage.setItem('hasSeenOnboarding_v1', 'true');
    }} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isSOSActive ? 'bg-error-container/20' : 'bg-background'}`}>
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-primary/10 blur-[150px] animate-pulse rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-tertiary/10 blur-[120px] rounded-full" />
      </div>

      <TopAppBar isSOS={isSOSActive} />
      <DynamicIsland />
      
      <Routes>
        <Route path="/" element={DashboardContent} />
        <Route path="/map" element={<div className="pt-20 pb-28 h-[100dvh]"><MapComponent reports={reports} userLocation={userLocation} safeZones={safeZones} showSafeZones={true} isInteractive={true} /></div>} />
        <Route path="/news" element={<NewsDashboard />} />
        
        {/* Health Module Cluster */}
        <Route path="/health" element={<HealthDashboard />} />
        <Route path="/health/auth" element={<HealthAuth />} />
        <Route path="/health/screening" element={<HealthScreening />} />
        <Route path="/health/mood" element={<MoodTracker />} />
        <Route path="/health/chat" element={<HealthChatbot />} />
        <Route path="/health/dictionary" element={<HealthDictionary />} />
        <Route path="/health/privacy" element={<HealthPrivacy />} />
        <Route path="/health/terms" element={<HealthTerms />} />
        <Route path="/health/about" element={<HealthAbout />} />

        {/* Other Modules */}
        <Route path="/education" element={<EducationDashboard />} />
        <Route path="/admin" element={
          isAdminAuthenticated ? (
            <div className="min-h-screen bg-[#020617] w-full relative z-10">
              <CommandCenter reports={reports} onClose={() => navigate('/')} />
            </div>
          ) : (
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} onClose={() => navigate('/')} />
          )
        } />
      </Routes>

      <BottomNavBar onSOSClick={handleSOSClick} isSOS={isSOSActive} />

      {isAiOpen && (
        <AiChatbot 
          onClose={() => setIsAiOpen(false)} 
          isSOS={isSOSActive} 
          userLocation={userLocation} 
          reports={reports} 
        />
      )}
    </div>
  );
};

export default App;