import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, requestForToken, onMessageListener, functions } from './firebase';
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
import ReportForm from './ReportForm';

// Integration: Service Pattern
import { aiService } from './services/health/aiService';
import { dataService } from './services/health/dataService';
import { hazardService } from './services/hazardService';
import { envService } from './services/envService';
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
import BmkgDashboard from './BmkgDashboard';

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
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [safeZones, setSafeZones] = useState([...bandungSafeZones, ...kabBandungSafeZones]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [weatherData, setWeatherData] = useState({ aqi: '--', precipitation: '--' });
  
  const location = useLocation();
  const focusCoords = location.state?.focusCoords || null;
  
  const { showNotification, showReminder } = useDynamicIsland();

  // Splash & Onboarding Logic
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = sessionStorage.getItem('hasSeenOnboarding_v1');
    if (hasSeenOnboarding) {
      setShowSplash(false); // Skip splash if already seen in session
    }

    // --- Pendaftaran Notifikasi Background (FCM) ---
    const setupFcm = async () => {
      // Registrasi Service Worker khusus untuk Firebase
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('✅ Service Worker FCM terdaftar sukses dengan scope:', registration.scope);
          
          // Minta token setelah SW siap
          const token = await requestForToken();
          if (token) {
            // Subscribe to all_users topic
            try {
              const subscribe = httpsCallable(functions, 'subscribeToTopic');
              await subscribe({ token, topic: 'all_users' });
              console.log('✅ Berhasil subscribe ke topik all_users');
            } catch (err) {
              console.warn('❌ Gagal subscribe ke topik:', err);
            }
          }
        } catch (err) {
          console.warn('❌ Gagal daftar Service Worker FCM / Ambil Token:', err);
        }
      }
    };

    setupFcm();
  }, [showNotification]); // Ditambahkan showNotification ke dep agar listener bisa pakai

  // Foreground Message Listener
  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        console.log('📬 Pesan foreground diterima:', payload);
        showNotification({
          title: payload.notification.title || 'Informasi Baru',
          description: payload.notification.body || 'Ada pesan masuk untuk Anda.',
          icon: 'notifications_active',
          action: () => navigate('/') 
        });
      })
      .catch((err) => console.log('Gagal dengar pesan foreground:', err));
  }, [showNotification, navigate]);

  // --- Optimized Data Fetching (v2.1) ---
  const fetchHazards = useCallback(async (signal) => {
    try {
      const combinedReports = await hazardService.fetchAllHazards(signal);
      setReports(combinedReports);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error("fetchHazards Error", e);
      }
    }
  }, []);

  const fetchRealtimeEnv = useCallback(async (lat, lon, signal) => {
    try {
      const weatherData = await envService.fetchRealtimeEnv(lat, lon, signal);
      setWeatherData(weatherData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('fetchRealtimeEnv Error', err);
      }
    }
  }, []);

    useEffect(() => {
    const controller = new AbortController();
    
    // Initial fetch
    fetchHazards(controller.signal);

    // Set up polling interval every 3 minutes
    const pollInterval = setInterval(() => {
      console.log('⏳ Auto-polling BMKG data...');
      fetchHazards(controller.signal);
    }, 180000); // 3 minutes

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
      clearInterval(pollInterval);
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
             <MapComponent 
                reports={reports} 
                userLocation={userLocation} 
                safeZones={safeZones} 
                showSafeZones={true} 
                selectedReportPosition={focusCoords}
             />
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
        <button onClick={() => navigate('/cuaca')} className="glass-card p-4 md:p-6 rounded-lg flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 hover:bg-surface-container-low transition-all shadow-lg text-center md:text-left group relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <span className="material-symbols-outlined text-sky-400 text-2xl group-hover:scale-125 transition-transform relative z-10">partly_cloudy_day</span>
           <span className="font-headline font-black text-[10px] md:text-xs uppercase tracking-widest leading-none relative z-10">Cuaca</span>
        </button>
        <button onClick={() => setIsReportFormOpen(true)} className="glass-card p-4 md:p-6 rounded-lg flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 hover:bg-surface-container-low transition-all shadow-lg text-center md:text-left group relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <span className="material-symbols-outlined text-amber-500 text-2xl group-hover:scale-125 transition-transform relative z-10">campaign</span>
           <span className="font-headline font-black text-[10px] md:text-xs uppercase tracking-widest leading-none relative z-10">Lapor</span>
        </button>
        <button onClick={handleSOSClick} className={`col-span-2 md:col-span-4 px-6 py-4 md:px-8 md:py-6 rounded-lg flex items-center justify-center gap-4 md:gap-6 font-headline font-black text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl active:scale-95 transition-all ${isSOSActive ? 'bg-white text-error' : 'bg-error text-white pulse-red'}`}>
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
        <Route path="/map" element={<div className="pt-20 pb-28 h-[100dvh]"><MapComponent reports={reports} userLocation={userLocation} safeZones={safeZones} showSafeZones={true} isInteractive={true} selectedReportPosition={focusCoords} /></div>} />
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
        <Route path="/cuaca" element={<BmkgDashboard />} />
        <Route path="/admin" element={
          isAdminAuthenticated ? (
            <CommandCenter reports={reports} onClose={() => navigate('/')} />
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

      {isReportFormOpen && (
        <ReportForm onClose={() => setIsReportFormOpen(false)} />
      )}
    </div>
  );
};

export default App;