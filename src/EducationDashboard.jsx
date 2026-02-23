import React, { useState } from 'react';
import { 
  BookOpen, ShieldCheck, Zap, Info, PhoneCall, X, 
  FileText, Rocket, Brain, HelpCircle, ChevronRight,
  Globe, Radio 
} from 'lucide-react';

const EducationDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('intro');

  const sopBencana = [
    {
      title: "Gempa Bumi (Sesar Lembang)",
      steps: [
        "Merunduk, lindungi kepala, dan bertahan (Drop, Cover, Hold on).",
        "Berlindung di bawah meja yang kokoh atau struktur bangunan yang kuat.",
        "Jauhi kaca, jendela, pintu luar, dan dinding bangunan tinggi.",
        "Jangan gunakan lift; gunakan tangga darurat jika memungkinkan."
      ],
      icon: <Zap className="text-orange-500" />
    },
    {
      title: "Banjir Luapan Sungai",
      steps: [
        "Matikan aliran listrik dan cabut peralatan elektronik dari stopkontak.",
        "Pindahkan barang berharga ke lantai atas atau tempat yang lebih tinggi.",
        "Segera evakuasi ke Titik Aman (Safe Zone) jika air mulai meninggi.",
        "Hindari berjalan di air yang mengalir karena risiko terseret arus."
      ],
      icon: <FileText className="text-blue-500" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[4000] bg-[#020617] text-slate-200 overflow-y-auto animate-in slide-in-from-bottom duration-500">
      {/* HEADER */}
      <header className="sticky top-0 bg-[#020617]/90 backdrop-blur-md p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center z-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2 rounded-xl border border-blue-500/30">
            <BookOpen className="text-blue-500" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Pusat Literasi <span className="text-blue-500">SafeTana</span></h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Mitigasi & Pengenalan Sistem</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('intro')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'intro' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Pengenalan
          </button>
          <button 
            onClick={() => setActiveTab('mitigasi')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'mitigasi' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Panduan Mitigasi
          </button>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-xl hover:bg-red-600 transition-all ml-2 text-white">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
        
        {activeTab === 'intro' ? (
          /* SECTION 1: HALAMAN PENGENALAN */
          <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
            <section className="text-center space-y-4 max-w-2xl mx-auto">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Waspada & Tangguh Bersama SafeTana</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                Indonesia berada di wilayah "Ring of Fire". SafeTana hadir sebagai jembatan informasi kritis untuk memastikan Anda dan keluarga memiliki waktu berharga untuk menyelamatkan diri.
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-red-500/50 transition-all">
                <ShieldCheck className="text-red-500 mb-6" size={32} />
                <h4 className="font-black text-lg text-white mb-4 uppercase tracking-tighter">Urgensi Kesiapsiagaan</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  Bencana alam tidak dapat dicegah, namun dampaknya bisa diminimalisir. SafeTana membantu Anda memetakan risiko di sekitar lokasi Anda secara instan.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-blue-500/50 transition-all">
                <Globe className="text-blue-500 mb-6" size={32} />
                <h4 className="font-black text-lg text-white mb-4 uppercase tracking-tighter">Pantauan Terpadu</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  Kami mengintegrasikan data aktivitas seismik dan kondisi cuaca ekstrem langsung ke genggaman Anda berdasarkan titik koordinat GPS Anda.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-900/20 to-slate-900 border border-red-800/30 p-8 rounded-[3rem]">
              <div className="flex items-start gap-4">
                <Radio className="text-red-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-black text-white uppercase tracking-tighter mb-2 italic">Satu Pintu Informasi BPBD</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-bold">
                    Seluruh peringatan dini dan instruksi evakuasi di aplikasi ini terhubung langsung dengan sistem komando otoritas penanggulangan bencana (BPBD).
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SECTION 2: PANDUAN MITIGASI */
          <div className="space-y-10 animate-in fade-in slide-in-from-left duration-500">
            <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Prosedur Operasi Standar (SOP)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sopBencana.map((item, idx) => (
                <div key={idx} className="bg-slate-900/30 border border-slate-800 p-8 rounded-[3rem] hover:border-orange-500/30 transition-all shadow-inner">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-slate-800 rounded-2xl">{item.icon}</div>
                    <h4 className="font-black text-sm text-white uppercase tracking-tighter">{item.title}</h4>
                  </div>
                  <ul className="space-y-4">
                    {item.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-3 text-[11px] text-slate-400 font-bold leading-relaxed">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <section className="bg-blue-600 rounded-[3rem] p-10 flex flex-wrap justify-between items-center gap-8 shadow-2xl shadow-blue-600/20">
              <div className="max-w-md">
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Siaga 24 Jam</h4>
                <p className="text-[10px] text-blue-100 font-bold leading-relaxed uppercase tracking-widest italic">
                  Jika Anda berada dalam situasi kritis, hubungi pusat komando darurat sekarang juga.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <a href="tel:112" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all uppercase tracking-widest text-[10px]">
                  <PhoneCall size={18} /> Call Center 112
                </a>
                <p className="text-[8px] text-center text-blue-200 font-black uppercase tracking-widest italic">Layanan Bebas Pulsa</p>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationDashboard;