import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Map as MapIcon, 
  Users, 
  Activity, 
  Navigation, 
  ShieldAlert,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  // Simulasi data dari AI/Backend
  const [reports, setReports] = useState([
    { id: 1, type: 'Banjir', location: 'Bandung Selatan', time: '2 menit yang lalu', status: 'Kritis' },
    { id: 2, type: 'Gempa', location: 'Sukabumi', time: '15 menit yang lalu', status: 'Waspada' },
    { id: 3, type: 'Longsor', location: 'Sumedang', time: '1 jam yang lalu', status: 'Selesai' },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 lg:p-8">
      {/* --- TOP BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Disaster AI Dashboard</h1>
          <p className="text-slate-400">Pemantauan Risiko & Tanggap Darurat Real-time</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <Clock size={18} className="text-blue-400" />
            <span className="text-sm font-mono">06 Feb 2026 | 20:45 WIB</span>
          </div>
        </div>
      </div>

      {/* --- QUICK STATS (AI ANALYTICS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Kejadian (24j)" value="12" icon={<Activity className="text-blue-400" />} color="border-blue-500" />
        <StatCard title="Area Risiko Tinggi" value="4" icon={<AlertOctagon className="text-red-400" />} color="border-red-500" />
        <StatCard title="Relawan Aktif" value="158" icon={<Users className="text-green-400" />} color="border-green-500" />
        <StatCard title="Prediksi AI (Akurasi)" value="94%" icon={<ShieldAlert className="text-purple-400" />} color="border-purple-500" />
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: MAP VIEW (2/3 Width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl h-[550px] relative">
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Layer Peta</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-xs rounded-md">Hotspots</button>
                <button className="px-3 py-1 bg-slate-700 text-xs rounded-md hover:bg-slate-600">Evakuasi</button>
              </div>
            </div>
            
            {/* Placeholder untuk Leaflet/Google Maps */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-slate-800">
              <MapIcon size={64} className="text-slate-600 mb-4 animate-pulse" />
              <p className="text-slate-400 font-medium">Menginisialisasi Peta Geospasial...</p>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE FEED & ACTIONS (1/3 Width) */}
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-red-600/20 border border-red-600/50 rounded-xl hover:bg-red-600/30 transition group">
              <AlertOctagon className="text-red-500 mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-bold uppercase">Kirim SOS</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-blue-600/20 border border-blue-600/50 rounded-xl hover:bg-blue-600/30 transition group">
              <Navigation className="text-blue-500 mb-2 group-hover:scale-110 transition" />
              <span className="text-xs font-bold uppercase">Rute Aman</span>
            </button>
          </div>

          {/* Incident Feed */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Activity size={20} className="text-orange-500" /> Laporan Terbaru
              </h3>
              <span className="text-[10px] bg-slate-700 px-2 py-1 rounded uppercase tracking-widest text-slate-300 font-bold">Live</span>
            </div>
            
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {reports.map((report) => (
                <div key={report.id} className="p-3 bg-slate-700/40 rounded-xl border border-slate-600/50 hover:bg-slate-700 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-bold text-white">{report.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      report.status === 'Kritis' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{report.location}</p>
                  <div className="flex items-center text-[10px] text-slate-500">
                    <Clock size={10} className="mr-1" /> {report.time}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 text-xs text-blue-400 hover:text-blue-300 font-semibold transition border-t border-slate-700 pt-4">
              Lihat Semua Laporan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-komponen untuk Card Statistik
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-slate-800 p-5 rounded-2xl border-b-4 ${color} shadow-lg hover:translate-y-[-4px] transition duration-300`}>
    <div className="flex justify-between items-center mb-2 text-slate-400">
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
  </div>
);

export default Dashboard;