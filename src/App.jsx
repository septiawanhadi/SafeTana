import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Activity, ShieldCheck, Navigation, 
  MessageSquare, Globe, Waves, MapPin, LayoutDashboard, Info, Radio, BookOpen
} from 'lucide-react';

// Integrasi Firebase & Komponen
import { requestForToken, onMessageListener } from './firebase';
import MapComponent from './MapComponent';
import AIChatbot from './AIChatbot.jsx';
import CommandCenter from './CommandCenter';
import EducationDashboard from './EducationDashboard';

const App = () => {
  // --- STATES ---
  const [showChat, setShowChat] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [selectedReportPosition, setSelectedReportPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [latestBroadcast, setLatestBroadcast] = useState(null);

  // --- DATABASE TITIK AMAN (Standardisasi Bandung) ---
  const safeZones = [
    { id: 'bdg-u1', position: [-6.8792, 107.6186], name: "Kantor Kelurahan Dago", type: "Evakuasi", addr: "Kec. Coblong, Kel. Dago", faskes: "Puskesmas Dago", alt: "Terminal Dago" },
    { id: 'bdg-u2', position: [-6.8845, 107.6135], name: "Kantor Kelurahan Lebakgede", type: "Evakuasi", addr: "Kec. Coblong, Kel. Lebakgede", faskes: "Puskesmas Puter", alt: "Saraga ITB" },
    { id: 'bdg-u3', position: [-6.8612, 107.5936], name: "Gymnasium UPI", type: "Evakuasi", addr: "Kec. Sukasari, Kel. Isola", faskes: "Puskesmas Sukasari", alt: "Kawasan UPI" },
    { id: 'bdg-t3', position: [-6.9025, 107.6188], name: "Lapangan Gasibu", type: "Evakuasi", addr: "Bandung Wetan", faskes: "Puskesmas Taman Sari", alt: "Gedung Sate" },
    { id: 'bdg-t4', position: [-6.9362, 107.6015], name: "Lapangan Tegalega", type: "Evakuasi", addr: "Kec. Regol", faskes: "Puskesmas Pasirluyu", alt: "Shelter Logistik" },
    { id: 'bdg-tr3', position: [-6.9416, 107.7042], name: "Masjid Al-Jabbar", type: "Evakuasi", addr: "Kel. Cimincrang", faskes: "Puskesmas Gedebage", alt: "Plaza Al-Jabbar" },
    { id: 'bdg-b1', position: [-6.9034, 107.5772], name: "Bandara Husein Sastranegara", type: "Evakuasi", addr: "Andir", faskes: "Puskesmas Andir", alt: "Jalur Udara" }
  ];

  // --- ALGORITMA AI: RISK PREDICTOR ---
  const predictRiskLevel = (weatherData, earthquakeData, userPos, zones) => {
    let riskScore = 0;
    if (weatherData?.wind_speed_10m > 15) riskScore += 15;
    if (weatherData?.weather_code >= 61) riskScore += 25;

    if (earthquakeData && userPos) {
      const dist = Math.hypot(earthquakeData.position[0] - userPos[0], earthquakeData.position[1] - userPos[1]);
      if (dist < 0.5) riskScore += 50; 
      else if (dist < 1.5) riskScore += 25;
    }

    const isNearHelp = zones.some(zone => {
      if (!userPos) return false;
      const d = Math.hypot(zone.position[0] - userPos[0], zone.position[1] - userPos[1]);
      return d < 0.02;
    });
    if (isNearHelp) riskScore -= 10;

    if (riskScore >= 60) return { label: "TINGGI", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/50" };
    if (riskScore >= 30) return { label: "SEDANG", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/50" };
    return { label: "RENDAH", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/50" };
  };

  // --- LOGIKA DATA & LOKASI ---
  const fetchLocalWeather = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`);
      if (res.ok) {
        const data = await res.json();
        setReports(prev => [
          {
            source: 'Open-Meteo (GPS)', type: 'Kondisi Lokal', loc: 'Sekitar Anda',
            position: [lat, lon], desc: `Suhu: ${data.current.temperature_2m}°C | Angin: ${data.current.wind_speed_10m} km/h`,
            weather_code: data.current.weather_code, wind_speed_10m: data.current.wind_speed_10m,
            statusColor: data.current.weather_code >= 61 ? 'bg-orange-500' : 'bg-yellow-500'
          },
          ...prev.filter(r => r.source !== 'Open-Meteo (GPS)')
        ]);
      }
    } catch (e) { console.warn("Weather Sync Failed"); }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = [position.coords.latitude, position.coords.longitude];
        setUserLocation(pos);
        setSelectedReportPosition(pos);
        fetchLocalWeather(pos[0], pos[1]);
      });
    }
  };

  const fetchHazards = async () => {
    setLoading(true);
    try {
      const resBMKG = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
      const dataBMKG = await resBMKG.json();
      const bmkg = dataBMKG.Infogempa.gempa.slice(0, 2).map(item => ({
        source: 'BMKG', type: `Gempa M ${item.Magnitude}`, loc: item.Wilayah,
        position: item.Coordinates.split(',').map(Number), desc: `MMI: ${item.Felt || 'II'}`,
        statusColor: 'bg-red-600'
      }));
      setReports(prev => [...prev, ...bmkg]);
    } catch (e) { console.error("API Sync Error"); }
    setLoading(false);
  };

  // --- HANDLERS ---
  const handleAdminBroadcast = (message) => {
    setLatestBroadcast(message);
    alert(`🚨 PESAN DARURAT BPBD: ${message}`);
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchHazards();
    detectLocation();
    requestForToken();
    onMessageListener()
      .then(payload => {
        setLatestBroadcast(payload.notification.body);
        alert(`🚨 BROADCAST: ${payload.notification.body}`);
      })
      .catch(err => console.log('Firebase Error:', err));
  }, []);

  // --- DATA PREPARATION (Safe Access) ---
  const weatherInfo = reports.find(r => r.source === 'Open-Meteo (GPS)');
  const earthquakeInfo = reports.find(r => r.source === 'BMKG');
  const currentRisk = predictRiskLevel(weatherInfo || null, earthquakeInfo || null, userLocation, safeZones);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 p-4 sticky top-0 z-[50] bg-[#020617]/95 backdrop-blur-md flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter uppercase leading-none text-white">SafeTana <span className="text-red-500">AI</span></h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 italic">BPBD Integrated</p>
          </div>
        </div>
        <div className="flex gap-3 text-white">
          <button onClick={() => setShowEducation(true)} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition shadow-lg">
            <BookOpen size={20} />
          </button>
          <button onClick={() => setShowAdmin(true)} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition shadow-lg">
            <LayoutDashboard size={20} />
          </button>
          <button onClick={detectLocation} className="text-[10px] font-bold bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 hover:border-blue-500 transition-all shadow-lg">
            <MapPin size={14} className={userLocation ? "text-green-500" : "text-blue-500"} />
            {userLocation ? "GPS AKTIF" : "LACAK LOKASI"}
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAP PANEL */}
        <div className="lg:col-span-8 h-[650px] rounded-[3.5rem] overflow-hidden border border-slate-800 shadow-2xl relative">
          <MapComponent 
            reports={reports} 
            selectedReportPosition={selectedReportPosition} 
            showSafeZones={showSafeZones} 
            safeZones={safeZones}
            userLocation={userLocation}
          />
        </div>

        {/* SIDEBAR PANEL */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-[650px]">
          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { setIsSOSActive(true); setShowChat(true); }} className="p-7 bg-red-600 rounded-[2.5rem] flex flex-col items-center shadow-xl animate-pulse group">
              <AlertTriangle size={32} className="mb-2 text-white group-hover:rotate-12 transition" />
              <span className="text-[11px] font-black uppercase text-white tracking-widest">SOS</span>
            </button>
            <button onClick={() => setShowSafeZones(!showSafeZones)} className={`p-7 rounded-[2.5rem] flex flex-col items-center shadow-xl transition-all ${showSafeZones ? 'bg-green-600' : 'bg-blue-600'}`}>
              <Navigation size={32} className="mb-2 text-white" />
              <span className="text-[11px] font-black uppercase text-white tracking-widest">{showSafeZones ? "Peta Bencana" : "Titik Aman"}</span>
            </button>
          </div>

          {/* INFO DISPLAY */}
          <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-8 flex-1 flex flex-col overflow-hidden shadow-inner relative">
            
            {/* 🚨 BROADCAST ALERT BOX */}
            {latestBroadcast && (
              <div className="bg-red-600 border border-red-400 p-5 rounded-[2rem] mb-6 shadow-xl animate-bounce relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Pesan Darurat Admin</span>
                </div>
                <p className="text-xs font-bold text-white leading-relaxed">{latestBroadcast}</p>
                <button onClick={() => setLatestBroadcast(null)} className="mt-3 text-[8px] font-black text-red-100 uppercase underline">Tandai Dibaca</button>
              </div>
            )}

            {/* AI RISK ANALYSIS BOX */}
            <div className={`p-5 rounded-3xl border ${currentRisk.border} mb-6 ${currentRisk.bg} backdrop-blur-xl transition-all`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase italic">Sistem Prediksi AI</p>
                  <h4 className={`text-xl font-black ${currentRisk.color} tracking-tighter`}>RISIKO {currentRisk.label}</h4>
                </div>
                <Activity size={24} className={`${currentRisk.color} animate-pulse`} />
              </div>
            </div>

            {/* LIST HEADER */}
            <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                {showSafeZones ? "TITIK EVAKUASI BANDUNG" : "UPDATE BENCANA TERKINI"}
              </h3>
            </header>
            
            {/* LIST CONTENT */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Sinkronisasi Data...</p>
                </div>
              ) : (
                <>
                  {showSafeZones ? safeZones.map((zone) => (
                    <div key={zone.id} onClick={() => window.open(`https://www.google.com/maps?q=${zone.position[0]},${zone.position[1]}`, '_blank')} className="p-5 bg-green-950/20 rounded-[2rem] border border-green-900/30 hover:border-green-500 transition-all cursor-pointer group mb-2">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-950 px-2 py-0.5 rounded-full">{zone.type}</span>
                        <Navigation size={14} className="text-green-500 opacity-50" />
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight">{zone.name}</h4>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{zone.addr}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2 rounded-xl text-[8px] border border-slate-800">
                          <p className="text-slate-500 font-black uppercase">Fas. Medis</p>
                          <p className="font-bold text-slate-300">{zone.faskes}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl text-[8px] border border-slate-800">
                          <p className="text-slate-500 font-black uppercase">Alternatif</p>
                          <p className="font-bold text-slate-300">{zone.alt}</p>
                        </div>
                      </div>
                    </div>
                  )) : reports.map((r, i) => (
                    <div key={i} onClick={() => setSelectedReportPosition(r.position)} className="p-5 bg-slate-800/20 rounded-[2rem] border border-slate-800 hover:border-blue-500 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{r.source}</span>
                        <div className={`w-2 h-2 rounded-full ${r.statusColor || 'bg-blue-600'}`} />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition">{r.type}</h4>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed italic">{r.desc}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          
          {/* AI CHATBOT BUTTON */}
          <button onClick={() => setShowChat(true)} className="group w-full bg-white hover:bg-slate-200 text-slate-950 p-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] transition shadow-2xl flex items-center justify-center gap-3">
            <MessageSquare size={20} /> ASISTEN AI SAFETANA
          </button>
        </div>
      </main>

      {/* OVERLAYS & MODALS */}
     {showAdmin && (
  <CommandCenter 
    users={[
      { id: 1, name: "Septiawan Hadi Prasetyoo", pos: userLocation, status: "Aman", battery: "85%", lastUpdate: "Baru saja" },
      { id: 2, name: "Warga Kel. Dago", pos: [-6.8792, 107.6186], status: "Butuh Evakuasi", battery: "12%", lastUpdate: "2 mnt lalu" }
    ]} 
    onClose={() => setShowAdmin(false)} 
    onFocusUser={(pos) => { 
      setSelectedReportPosition(pos); 
      setShowAdmin(false); 
    }} 
    onSendBroadcast={handleAdminBroadcast}
  />
)}
      {showEducation && <EducationDashboard onClose={() => setShowEducation(false)} />}
      {showChat && <AIChatbot onClose={() => { setShowChat(false); setIsSOSActive(false); }} isSOS={isSOSActive} />}
    </div>
  );
};

export default App;
