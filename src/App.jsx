import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Activity, ShieldCheck, Navigation,
  MessageSquare, Globe, Waves, MapPin, LayoutDashboard,
  Info, Radio, BookOpen, ChevronRight, Newspaper
} from 'lucide-react';

// Integrasi Komponen
import MapComponent from './MapComponent';
import AiChatbot from './AiChatbot';
import CommandCenter from './CommandCenter';
import EducationDashboard from './EducationDashboard';
import AdminLogin from './AdminLogin';
import NewsDashboard from './NewsDashboard';
import { maskName, maskPhone } from './securityUtils';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { calculateDistance, reverseGeocode } from './utils/geoUtils';



const App = () => {
  const navigate = useNavigate();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // --- STATES NAVIGASI ---
  const [showEducation, setShowEducation] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // --- STATES DATA ---
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [safeZones, setSafeZones] = useState([]); // State for safe zones from Firestore
  const [selectedReportPosition, setSelectedReportPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [latestBroadcast, setLatestBroadcast] = useState(null);



  // --- LOGIKA DATA ---
  const fetchHazards = async () => {
    // 0. Cek Cache LocalStorage
    const cachedReports = localStorage.getItem('safetana_reports_cache');
    if (cachedReports) {
      try {
        setReports(JSON.parse(cachedReports));
      } catch (e) {
        console.error("Gagal membaca cache:", e);
      }
    } else {
      setLoading(true); // Hanya tampilkan loading penuh jika tidak ada cache sama sekali
    }

    try {
      // 1. Fetch BMKG Earthquake Data (Daftar Gempa Dirasakan skala berapapun)
      const resBMKG = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempadirasakan.json');
      const dataBMKG = await resBMKG.json();

      // gempadirasakan.json mengembalikan array gempa yang dirasakan tanpa batas magnitudo minimum
      const bmkg = dataBMKG.Infogempa.gempa.slice(0, 5).map(item => ({
        source: 'BMKG',
        type: `Gempa M ${item.Magnitude}`,
        loc: item.Wilayah,
        position: item.Coordinates.split(',').map(Number),
        desc: `Skala MMI: ${item.Dirasakan || 'Belum diketahui'}`,
        statusColor: 'bg-red-600'
      }));

      // 2. Fetch PetaBencana API (Last 7 Days, Indonesia)
      let petabencana = [];
      try {
        const resPB = await fetch('https://data.petabencana.id/reports?timeperiod=604800');
        const dataPB = await resPB.json();

        if (dataPB && dataPB.result && dataPB.result.features) {
          petabencana = dataPB.result.features.slice(0, 15).map(feature => {
            const props = feature.properties;
            const typeRaw = props.hazard_type || 'unknown';

            // Mapping Tipe Bencana & Warna
            let typeMap = 'Bencana Bantuan';
            let colorMap = 'bg-orange-500';

            if (typeRaw === 'flood') { typeMap = 'Banjir'; colorMap = 'bg-blue-500'; }
            else if (typeRaw === 'earthquake') { typeMap = 'Gempa Bumi'; colorMap = 'bg-red-500'; }
            else if (typeRaw === 'wind') { typeMap = 'Angin Kencang'; colorMap = 'bg-gray-400'; }
            else if (typeRaw === 'volcano') { typeMap = 'Gunung Api'; colorMap = 'bg-orange-600'; }
            else if (typeRaw === 'fire') { typeMap = 'Kebakaran'; colorMap = 'bg-red-600'; }
            else if (typeRaw === 'haze') { typeMap = 'Kabut Asap'; colorMap = 'bg-slate-500'; }

            // Extrak Lokasi
            let locName = props.tags?.district || props.tags?.local_area || 'Wilayah Terdampak';

            // API mengembalikan koordinat [Lng, Lat], kita butuh [Lat, Lng]
            const coords = feature.geometry.coordinates;
            const position = [coords[1], coords[0]];

            return {
              source: 'PetaBencana',
              type: typeMap,
              loc: maskName(locName), // Apply masking to location name/reporter name if any PII exists
              position: position,
              desc: maskName(props.tags?.description) || `Status: ${props.status} / Publik`,
              statusColor: colorMap
            };
          });
        }
      } catch (pbError) {
        console.warn("Gagal mengambil data PetaBencana:", pbError);
      }

      // 3. Fetch GDACS API (Global Disaster Alert and Coordination System)
      let gdacsData = [];
      try {
        const resGDACS = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP');
        const dataGDACS = await resGDACS.json();
        if (dataGDACS && dataGDACS.features) {
          // Filter hanya untuk Indonesia
          const idnEvents = dataGDACS.features.filter(f =>
            f.properties && f.properties.country && f.properties.country.toLowerCase().includes('indonesia')
          );

          gdacsData = await Promise.all(idnEvents.map(async feature => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates;

            let typeMap = props.eventtype;
            if (props.eventtype === 'EQ') typeMap = 'Gempa Bumi';
            else if (props.eventtype === 'TC') typeMap = 'Siklon Tropis';
            else if (props.eventtype === 'FL') typeMap = 'Banjir';
            else if (props.eventtype === 'VO') typeMap = 'Gunung Api';
            else if (props.eventtype === 'DR') typeMap = 'Kekeringan';
            else if (props.eventtype === 'WF') typeMap = 'Kebakaran Hutan';

            let colorMap = 'bg-slate-500';
            if (props.alertlevel === 'Red') colorMap = 'bg-red-600';
            else if (props.alertlevel === 'Orange') colorMap = 'bg-orange-500';
            else if (props.alertlevel === 'Green') colorMap = 'bg-green-500';

            let rawLoc = props.eventname || props.country;
            if (!rawLoc || rawLoc.trim().toLowerCase() === 'indonesia' || rawLoc.trim() === '') {
              // Jika lokasi terlalu generik (misal hanya "Indonesia"), gunakan reverse geocoding
              const geoLoc = await reverseGeocode(coords[1], coords[0]);
              if (geoLoc) {
                rawLoc = geoLoc;
              } else {
                rawLoc = 'Wilayah Terdampak (GDACS)';
              }
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
        console.warn("Gagal mengambil data GDACS:", gdacsError);
      }

      const combinedReports = [...bmkg, ...petabencana, ...gdacsData];
      setReports(combinedReports);

      // Simpan ke LocalStorage agar saat offline/reload cepat, data tetap ada
      localStorage.setItem('safetana_reports_cache', JSON.stringify(combinedReports));
      localStorage.setItem('safetana_last_fetch_time', new Date().getTime().toString());

    } catch (e) {
      console.error("API Error", e);
      // Fallback: Jika tidak ada cache, tampilkan data dummy
      if (!cachedReports) {
        setReports([
          {
            source: 'BPBD Jabar', type: 'Tanah Longsor', loc: 'Kec. Cililin, Kabupaten Bandung Barat',
            position: [-6.95, 107.46], desc: 'Jalan terputus, 15 KK dievakuasi',
            statusColor: 'bg-emerald-500'
          }
        ]);
      } else {
        // Jika API gagal tapi ada cache, pastikan kita tetap menampilkan cache
        try {
          setReports(JSON.parse(cachedReports));
        } catch (parseError) {
          console.error("Gagal membaca cache saat fallback:", parseError);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHazards();

    let uid = localStorage.getItem('safetana_user_id');
    if (!uid) {
      uid = 'user-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('safetana_user_id', uid);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation([lat, lng]);

          // Sync initial location to Firestore
          try {
            await setDoc(doc(db, 'active_users', uid), {
              name: `Pengguna ${uid.substring(5, 9).toUpperCase()}`,
              status: isSOSActive ? 'Butuh Evakuasi' : 'Aman',
              pos: [lat, lng],
              lastActive: serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.error("Gagal sinkronisasi lokasi pengguna:", e);
          }
        },
        (err) => {
          console.warn("Akses lokasi ditolak atau gagal:", err);
          // Set lokasi default (misal Jakarta) jika akses ditolak agar fitur lain tetap jalan
          setUserLocation([-6.200000, 106.816666]);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  // UseEffect terpisah untuk merespons perubahan isSOSActive setelah location ditemukan
  useEffect(() => {
    if (userLocation) {
      const uid = localStorage.getItem('safetana_user_id');
      try {
        setDoc(doc(db, 'active_users', uid), {
          status: isSOSActive ? 'Butuh Evakuasi' : 'Aman',
          lastActive: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Gagal update status SOS:", e);
      }
    }
  }, [isSOSActive, userLocation]);

  // --- LISTENER SAFE ZONES ---
  useEffect(() => {
    const q = query(collection(db, 'safe_zones')); // Fetch all without order or limit for now
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const zones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSafeZones(zones);
    });
    return () => unsubscribe();
  }, []);

  // --- LISTENER BROADCAST FIRESTORE ---
  useEffect(() => {
    if (!userLocation) return;

    // Listen to the latest broadcast
    const q = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const broadcast = change.doc.data();

            // Periksa jika broadcast baru saja ditambahkan (bukan data lama dari local cache/fetch awal)
            // Asumsi: Jika waktu serverTimestamp belum ada (null/pending), ini adalah data baru yang di-trigger lokal.
            // Atau jika timestamp ada, kita bisa cek apakah ia baru terjadi dalam 1 menit terakhir.
            const isRecent = broadcast.timestamp
              ? (Date.now() - broadcast.timestamp.toMillis() < 60000)
              : true;

            if (isRecent && broadcast.position && userLocation) {
              // Hitung jarak (Haversine)
              const distance = calculateDistance(
                userLocation[0], userLocation[1],
                broadcast.position[0], broadcast.position[1]
              );

              // Jika jarak kurang dari 100 KM (dapat disesuaikan)
              if (distance <= 100) {
                setLatestBroadcast({ ...broadcast, distance });
              }
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [userLocation]);

  const MainContent = (
    <>
      {/* 1. LAYER ONBOARDING / EDUKASI */}
      {showEducation && (
        <EducationDashboard onClose={() => setShowEducation(false)} />
      )}

      {/* 2. DASHBOARD UTAMA */}
      {!showEducation && (
        <>
          <nav className="border-b border-slate-800 p-4 sticky top-0 z-[50] bg-[#020617]/95 backdrop-blur-md flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-2xl shadow-lg h-10 w-10 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="SafeTana AI Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-black text-xl text-white uppercase tracking-tighter leading-none">SafeTana <span className="text-red-500">AI</span></h1>
            </div>
            <div className="flex gap-3 text-white">
              <button onClick={() => navigate('/news')} className="p-2.5 bg-slate-800 rounded-xl hover:text-white transition shadow-lg group relative" title="Pusat Berita">
                <Newspaper size={20} className="group-hover:text-blue-400 transition-colors" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Berita</span>
              </button>
              <button onClick={() => setShowEducation(true)} className="p-2.5 bg-slate-800 rounded-xl hover:text-white transition shadow-lg">
                <BookOpen size={20} />
              </button>
              <button onClick={() => navigate('/safetana-admin')} className="p-2.5 bg-slate-800 rounded-xl hover:text-white transition shadow-lg">
                <LayoutDashboard size={20} />
              </button>
            </div>
          </nav>

          {/* TAMPILAN BROADCAST DINAMIS DIPINDAHKAN KE BAWAH */}

          <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in duration-700 min-h-[calc(100vh-80px)]">
            {/* PANEL PETA */}
            <div className="lg:col-span-8 h-[50vh] min-h-[400px] lg:h-[650px] rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden border border-slate-800 relative shadow-2xl shrink-0 order-1 lg:order-none">
              <MapComponent
                reports={reports}
                selectedReportPosition={selectedReportPosition}
                showSafeZones={showSafeZones}
                safeZones={safeZones}
                userLocation={userLocation}
              />
            </div>

            {/* PANEL SIDEBAR */}
            <div className="lg:col-span-4 space-y-6 flex flex-col h-auto lg:h-[650px] order-2 lg:order-none">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setIsSOSActive(true); setShowChat(true); }} className="p-5 lg:p-7 bg-red-600 rounded-[2rem] lg:rounded-[2.5rem] flex flex-col items-center animate-pulse shadow-xl active:scale-95 transition-transform">
                  <AlertTriangle size={28} className="text-white mb-2 lg:w-8 lg:h-8" />
                  <span className="text-[10px] lg:text-[11px] font-black uppercase text-white tracking-widest">SOS</span>
                </button>
                <button onClick={() => setShowSafeZones(!showSafeZones)} className={`p-5 lg:p-7 rounded-[2rem] lg:rounded-[2.5rem] flex flex-col items-center ${showSafeZones ? 'bg-green-600' : 'bg-blue-600'} shadow-xl transition-all active:scale-95`}>
                  <Navigation size={28} className="text-white mb-2 lg:w-8 lg:h-8" />
                  <span className="text-[10px] lg:text-[11px] font-black uppercase text-white tracking-widest text-center">{showSafeZones ? "Peta Bencana" : "Titik Aman"}</span>
                </button>
              </div>

              <div className="bg-slate-900/40 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-800 p-6 lg:p-8 flex-1 flex flex-col overflow-hidden shadow-inner relative min-h-[400px] lg:min-h-0">
                <header className="flex justify-between items-center mb-5 lg:mb-6 border-b border-slate-800 pb-4 shrink-0">
                  <h3 className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.3em] text-slate-500">
                    {showSafeZones ? "TITIK EVAKUASI BANDUNG" : "UPDATE BENCANA TERKINI"}
                  </h3>
                </header>

                <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Sinkronisasi...</p>
                    </div>
                  ) : (
                    <>
                      {showSafeZones ? (
                        safeZones.map((zone) => (
                          <div
                            key={zone.id}
                            onClick={() => setSelectedReportPosition(zone.position)}
                            className="p-5 bg-green-950/20 rounded-[2.5rem] border border-green-900/30 hover:border-green-500 transition-all cursor-pointer group mb-2"
                          >
                            {/* ... bagian header kartu ... */}
                            <h4 className="text-sm font-bold text-white leading-tight">{zone.name}</h4>
                            <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{zone.addr}</p>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <div className="bg-slate-950 p-2 rounded-xl text-[8px] border border-slate-800">
                                <p className="text-slate-500 font-black uppercase mb-1">Fas. Medis</p>
                                <p className="font-bold text-slate-300">{zone.faskes}</p> {/* Menampilkan data faskes */}
                              </div>
                              <div className="bg-slate-950 p-2 rounded-xl text-[8px] border border-slate-800">
                                <p className="text-slate-500 font-black uppercase mb-1">Status</p>
                                <p className="font-bold text-green-400">Siaga Aman</p>
                              </div>
                            </div>
                            {/* ... bagian footer kartu ... */}
                          </div>
                        ))
                      ) : (
                        /* DETAIL INFORMASI BENCANA */
                        reports.map((r, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedReportPosition(r.position)}
                            className="p-5 bg-slate-800/20 rounded-[2.5rem] border border-slate-800 hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">{r.source}</span>
                              <div className={`w-2 h-2 rounded-full ${r.statusColor} animate-pulse`} />
                            </div>
                            <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition uppercase tracking-tighter">{r.type}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold italic">{r.loc}</p>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                                <p className="text-[7px] font-black text-slate-500 uppercase mb-1">Koordinat</p>
                                <p className="text-[9px] font-bold text-slate-300">
                                  {r.position[0].toFixed(2)}, {r.position[1].toFixed(2)}
                                </p>
                              </div>
                              <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                                <p className="text-[7px] font-black text-slate-500 uppercase mb-1">Keterangan</p>
                                <p className="text-[9px] font-bold text-blue-400 uppercase">Pantauan</p>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                              <div className="flex items-center gap-2 text-slate-500">
                                <MapPin size={10} />
                                <span className="text-[8px] font-black uppercase tracking-widest">Fokus Lokasi</span>
                              </div>
                              <ChevronRight size={14} className="text-slate-700 group-hover:text-blue-500 transition" />
                            </div>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>

              <button onClick={() => setShowChat(true)} className="group w-full bg-white hover:bg-slate-200 text-slate-950 p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] font-black text-[10px] lg:text-[12px] uppercase tracking-[0.2em] lg:tracking-[0.3em] flex items-center justify-center gap-2 lg:gap-3 shadow-2xl transition-all active:scale-95 shrink-0 mt-auto">
                <MessageSquare size={18} className="lg:w-5 lg:h-5" /> ASISTEN AI SAFETANA
              </button>
            </div>
          </main>

          {/* CHAT MODAL UNTUK DASHBOARD */}
          {showChat && <AiChatbot onClose={() => { setShowChat(false); setIsSOSActive(false); }} isSOS={isSOSActive} userLocation={userLocation} reports={reports} />}
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* TAMPILAN BROADCAST DINAMIS (OVERLAY) */}
      {latestBroadcast && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-2xl w-full mx-auto bg-[#FFFF00] border-[8px] border-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,0,0.4)] font-sans text-black animate-pulse-slow">
            <div className="p-6 md:p-10">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 bg-black flex items-center justify-center rounded-2xl shrink-0">
                  <svg viewBox="0 0 24 24" className="w-16 h-16 fill-[#FFFF00]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 12h3v8h14v-8h3L12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V9h2v4z" />
                    <path d="M3 14l2-2m14 0l2 2m-18 4l2-2m14 0l2 2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">{latestBroadcast.type}</h1>
                </div>
              </div>

              <div className="bg-transparent mb-8">
                <h2 className="text-2xl font-black mb-4 flex justify-start items-center gap-4 text-black">
                  <span>Alert</span>
                  <span className="font-medium text-xl">{new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} (WIB)</span>
                </h2>

                <div className="space-y-4 text-lg font-medium leading-relaxed text-black">
                  <p>{latestBroadcast.desc}</p>
                  <p>Terdeteksi pada koordinat: {latestBroadcast.position[0].toFixed(2)}, {latestBroadcast.position[1].toFixed(2)} ({latestBroadcast.source})</p>
                  <p className="font-bold text-red-600 mt-2">
                    Anda berada dalam radius bahaya ({latestBroadcast.distance.toFixed(1)} km dari pusat bencana). Segera cari tempat aman!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setLatestBroadcast(null)}
                  className="flex flex-col items-center justify-center border-2 border-black bg-transparent py-4 px-6 hover:bg-black/10 transition-colors w-40 h-24"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 mb-2 stroke-black" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-medium">Confirmation</span>
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={() => navigate('/safetana-admin')} // Atau rute lain untuk detail
                  className="flex flex-col items-center justify-center border-2 border-black bg-transparent py-4 px-6 hover:bg-black/10 transition-colors w-40 h-24"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 mb-2 fill-black" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="black" strokeWidth="2" fill="none" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="black" strokeWidth="2" />
                    <line x1="7" y1="15" x2="17" y2="15" stroke="black" strokeWidth="2" />
                  </svg>
                  <span className="text-xs font-medium">Show Details</span>
                </button>
              </div>

              <button
                onClick={() => setLatestBroadcast(null)}
                className="flex flex-col items-center justify-center border-[4px] border-black bg-white py-4 px-8 hover:bg-black hover:text-[#FFFF00] transition-colors w-full rounded-2xl group"
              >
                <span className="text-2xl font-black uppercase tracking-widest mt-1">SAYA MENGERTI (TUTUP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={MainContent} />
        <Route path="/news" element={<NewsDashboard />} />
        <Route path="/safetana-admin" element={
          isAdminAuthenticated ? (
            <div className="min-h-screen bg-[#020617] w-full relative z-10">
              <CommandCenter reports={reports} users={[]} onClose={() => navigate('/')} onSendBroadcast={() => { }} />
            </div>
          ) : (
            <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} onClose={() => navigate('/')} />
          )
        } />
      </Routes>
    </div>
  );
};

export default App;