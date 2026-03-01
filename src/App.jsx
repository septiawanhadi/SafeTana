import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Activity, ShieldCheck, Navigation,
  MessageSquare, Globe, Waves, MapPin, LayoutDashboard,
  Info, Radio, BookOpen, ChevronRight
} from 'lucide-react';

// Integrasi Komponen
import MapComponent from './MapComponent';
import AiChatbot from './AiChatbot';
import CommandCenter from './CommandCenter';
import EducationDashboard from './EducationDashboard';

const App = () => {
  // --- STATES NAVIGASI ---
  const [showEducation, setShowEducation] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // --- STATES DATA ---
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [selectedReportPosition, setSelectedReportPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [latestBroadcast, setLatestBroadcast] = useState(null);

  <div class="max-w-2xl mx-auto bg-[#FFFF00] border-2 border-gray-400 rounded-xl overflow-hidden shadow-2xl font-sans text-black">
    <div class="p-6">
      <div class="flex items-start gap-6 mb-4">
        <div class="w-24 h-24 bg-black flex items-center justify-center rounded-sm">
          <svg viewBox="0 0 24 24" class="w-20 h-20 fill-[#FFFF00]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 12h3v8h14v-8h3L12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V9h2v4z" />
            <path d="M3 14l2-2m14 0l2 2m-18 4l2-2m14 0l2 2" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <h1 class="text-6xl font-bold tracking-tight">Earthquake</h1>
      </div>

      <div class="ml-4">
        <h2 class="text-4xl font-bold mb-4">Alert <span class="ml-12">18/02/2026 09:15 (WIB)</span></h2>

        <div class="space-y-4 text-xl font-semibold leading-tight">
          <p>Earthquake mag:5.7, 18-Feb-26 02:15:28 UTC, (148 km NorthWest MALUKUTENGGARABRT) ::BMKG -- PRELI...</p>

          <p>Info Gempa kekuatan:5.7 SR, 18-Feb-26 09:15:28 WIB, (148 km BaratLaut MALUKUTENGGARABRT) ::BMKG -- ...</p>
        </div>
      </div>

      <div class="flex justify-between mt-10">
        <button class="flex flex-col items-center justify-center border-2 border-black py-2 px-8 hover:bg-yellow-100 transition-colors">
          <svg class="w-10 h-10 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" />
          </svg>
          <span class="text-xl font-bold">Confirmation</span>
        </button>

        <button class="flex flex-col items-center justify-center border-2 border-black py-2 px-8 hover:bg-yellow-100 transition-colors">
          <svg class="w-10 h-10 mb-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <span class="text-xl font-bold">Show Details</span>
        </button>
      </div>
    </div>
  </div>
  // --- DATABASE TITIK AMAN ---
  const safeZones = [
    {
      id: 'bdg-u1',
      position: [-6.8792, 107.6186],
      name: "Kantor Kelurahan Dago",
      addr: "Kec. Coblong, Kel. Dago",
      faskes: "Puskesmas Dago"
    },
    {
      id: 'bdg-u2',
      position: [-6.8845, 107.6135],
      name: "Kantor Kelurahan Lebakgede",
      addr: "Kec. Coblong, Kel. Lebakgede",
      faskes: "Puskesmas Puter"
    },
    {
      id: 'bdg-u3',
      position: [-6.8612, 107.5936],
      name: "Gymnasium UPI",
      addr: "Kec. Sukasari, Kel. Isola",
      faskes: "Puskesmas Sukasari"
    },
    {
      id: 'bdg-s1',
      position: [-7.1039, 107.4578],
      name: "Kantor Desa Ciwidey",
      addr: "Kec. Ciwidey, Desa Ciwidey",
      faskes: "Puskesmas Ciwidey"
    },
    {
      id: 'bdg-s2',
      position: [-7.0227, 107.5197],
      name: "Gedung Inkanas (Shelter)",
      addr: "Kec. Soreang, Desa Terusan",
      faskes: "RSUD Otto Iskandar Di Nata"
    },
    {
      id: 'bdg-s3',
      position: [-7.1824, 107.5594],
      name: "Kantor Kecamatan Pangalengan",
      addr: "Kec. Pangalengan, Desa Pangalengan",
      faskes: "Puskesmas Pangalengan DTP"
    },
    {
      id: 'bdg-s4',
      position: [-7.0506, 107.5878],
      name: "Alun-Alun Banjaran",
      addr: "Kec. Banjaran, Desa Banjaran Kota",
      faskes: "Puskesmas Banjaran Kota"
    },
    {
      id: 'bdg-s5',
      position: [-6.9745, 107.6321],
      name: "Kantor Desa Bojongsoang",
      addr: "Kec. Bojongsoang, Desa Bojongsoang",
      faskes: "Puskesmas Bojongsoang"
    },
    {
      id: 'bdg-s6',
      position: [-7.0031, 107.5689],
      name: "Puskesmas Sangkanhurip (Titik Evakuasi)",
      addr: "Kec. Katapang, Desa Sukamukti",
      faskes: "Puskesmas Sangkanhurip"
    },
    {
      id: 'bdg-s7',
      position: [-7.1524, 107.3889],
      name: "Kantor Kecamatan Rancabali",
      addr: "Kec. Rancabali, Desa Patengan",
      faskes: "Puskesmas Rancabali"
    },
    {
      id: 'bdg-s8',
      position: [-7.0654, 107.5432],
      name: "GOR Cimaung",
      addr: "Kec. Cimaung, Desa Cimaung",
      faskes: "Puskesmas Cimaung"
    },
    {
      id: 'bdg-s9',
      position: [-7.2189, 107.6541],
      name: "Lapang Desa Tarumajaya",
      addr: "Kec. Kertasari, Desa Tarumajaya",
      faskes: "Puskesmas Kertasari"
    },
    {
      id: 'bdg-s10',
      position: [-7.0765, 107.7123],
      name: "Kantor Desa Ciparay",
      addr: "Kec. Ciparay, Desa Ciparay",
      faskes: "Puskesmas Ciparay DTP"
    },
    {
      id: 'bdg-s11',
      position: [-7.0456, 107.7543],
      name: "Alun-Alun Majalaya",
      addr: "Kec. Majalaya, Desa Majalaya",
      faskes: "RSUD Majalaya"
    },
    {
      id: 'bdg-s12',
      position: [-6.9654, 107.7654],
      name: "RTC (Rancaekek Trade Center)",
      addr: "Kec. Rancaekek, Desa Bojongloa",
      faskes: "Puskesmas Rancaekek"
    },
    {
      id: 'bdg-s13',
      position: [-6.9123, 107.7234],
      name: "Kampus IPDN/Jatinangor",
      addr: "Kec. Jatinangor",
      faskes: "Puskesmas Jatinangor"
    },
    {
      id: 'bdg-s14',
      position: [-6.9876, 107.8234],
      name: "Stasiun Cicalengka (Titik Kumpul)",
      addr: "Kec. Cicalengka, Desa Cicalengka Kulon",
      faskes: "RSUD Cicalengka"
    }
  ];
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
      // 1. Fetch BMKG Earthquake Data
      const resBMKG = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json');
      const dataBMKG = await resBMKG.json();
      const bmkg = dataBMKG.Infogempa.gempa.slice(0, 2).map(item => ({
        source: 'BMKG', type: `Gempa M ${item.Magnitude}`, loc: item.Wilayah,
        position: item.Coordinates.split(',').map(Number), desc: `Skala MMI: ${item.Felt || 'II'}`,
        statusColor: 'bg-red-600'
      }));

      // 2. Fetch PetaBencana API (Last 7 Days, Indonesia)
      let petabencana = [];
      try {
        const resPB = await fetch('https://data.petabencana.id/reports?timeperiod=604800&admin=ID');
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
              loc: locName,
              position: position,
              desc: props.tags?.description || `Status: ${props.status} / Publik`,
              statusColor: colorMap
            };
          });
        }
      } catch (pbError) {
        console.warn("Gagal mengambil data PetaBencana:", pbError);
      }

      const combinedReports = [...bmkg, ...petabencana];
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">

      {/* 1. LAYER ONBOARDING / EDUKASI */}
      {showEducation && (
        <EducationDashboard onClose={() => setShowEducation(false)} />
      )}

      {/* 2. DASHBOARD UTAMA */}
      {!showEducation && (
        <>
          <nav className="border-b border-slate-800 p-4 sticky top-0 z-[50] bg-[#020617]/95 backdrop-blur-md flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <h1 className="font-black text-xl text-white uppercase tracking-tighter leading-none">SafeTana <span className="text-red-500">AI</span></h1>
            </div>
            <div className="flex gap-3 text-white">
              <button onClick={() => setShowEducation(true)} className="p-2.5 bg-slate-800 rounded-xl hover:text-white transition shadow-lg">
                <BookOpen size={20} />
              </button>
              <button onClick={() => setShowAdmin(true)} className="p-2.5 bg-slate-800 rounded-xl hover:text-white transition shadow-lg">
                <LayoutDashboard size={20} />
              </button>
            </div>
          </nav>

          <main className="max-w-[1600px] mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* PANEL PETA */}
            <div className="lg:col-span-8 h-[650px] rounded-[3.5rem] overflow-hidden border border-slate-800 relative shadow-2xl">
              <MapComponent
                reports={reports}
                selectedReportPosition={selectedReportPosition}
                showSafeZones={showSafeZones}
                safeZones={safeZones}
                userLocation={userLocation}
              />
            </div>

            {/* PANEL SIDEBAR */}
            <div className="lg:col-span-4 space-y-6 flex flex-col h-[650px]">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setIsSOSActive(true); setShowChat(true); }} className="p-7 bg-red-600 rounded-[2.5rem] flex flex-col items-center animate-pulse shadow-xl">
                  <AlertTriangle size={32} className="text-white mb-2" />
                  <span className="text-[11px] font-black uppercase text-white tracking-widest">SOS</span>
                </button>
                <button onClick={() => setShowSafeZones(!showSafeZones)} className={`p-7 rounded-[2.5rem] flex flex-col items-center ${showSafeZones ? 'bg-green-600' : 'bg-blue-600'} shadow-xl transition-all`}>
                  <Navigation size={32} className="text-white mb-2" />
                  <span className="text-[11px] font-black uppercase text-white tracking-widest">{showSafeZones ? "Peta Bencana" : "Titik Aman"}</span>
                </button>
              </div>

              <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 p-8 flex-1 flex flex-col overflow-hidden shadow-inner relative">
                <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
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

              <button onClick={() => setShowChat(true)} className="group w-full bg-white hover:bg-slate-200 text-slate-950 p-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl transition-all">
                <MessageSquare size={20} /> ASISTEN AI SAFETANA
              </button>
            </div>
          </main>
        </>
      )}

      {/* MODALS */}
      {showAdmin && <CommandCenter users={[]} onClose={() => setShowAdmin(false)} onFocusUser={(pos) => { setSelectedReportPosition(pos); setShowAdmin(false); }} />}
      {showChat && <AiChatbot onClose={() => { setShowChat(false); setIsSOSActive(false); }} isSOS={isSOSActive} />}
    </div>
  );
};

export default App;