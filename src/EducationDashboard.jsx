import React from 'react';
import { BookOpen, ShieldCheck, Zap, Info, Map as MapIcon, PhoneCall, X, FileText } from 'lucide-react';

const EducationDashboard = ({ onClose }) => {
  const sopBencana = [
    {
      title: "Gempa Bumi (Sesar Lembang)",
      steps: ["Merunduk dan lindungi kepala", "Berlindung di bawah meja kokoh", "Jauhi kaca dan bangunan tinggi"],
      icon: <Zap className="text-orange-500" />
    },
    {
      title: "Banjir Luapan Sungai",
      steps: ["Matikan aliran listrik rumah", "Pindahkan barang ke tempat tinggi", "Evakuasi ke titik aman terdekat"],
      icon: <FileText className="text-blue-500" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[4000] bg-[#020617] text-slate-200 overflow-y-auto animate-in slide-in-from-bottom duration-500">
      {/* HEADER */}
      <header className="sticky top-0 bg-[#020617]/90 backdrop-blur-md p-6 border-b border-slate-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-500" size={28} />
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter">Pusat Literasi <span className="text-blue-500">SafeTana</span></h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Panduan Mitigasi & Penggunaan Aplikasi</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-800 rounded-2xl hover:bg-red-600 transition-all">
          <X size={20} />
        </button>
      </header>

      <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
        
        {/* SECTION 1: PEMAHAMAN APLIKASI */}
        <section>
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Info size={14} /> Mengenal SafeTana AI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
              <h4 className="font-bold text-white mb-4">Visi & Misi</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                SafeTana AI hadir untuk mendemokratisasi informasi bencana. Kami percaya bahwa setiap warga Bandung berhak mendapatkan peringatan dini yang personal dan akurat untuk meminimalisir risiko jatuhnya korban jiwa.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
              <h4 className="font-bold text-white mb-4">Cara Kerja AI</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Aplikasi menggunakan algoritma <span className="text-blue-400">Decision Tree</span> untuk menganalisis data sensor cuaca dan seismik secara real-time. Hasilnya adalah skor risiko yang disesuaikan dengan koordinat GPS Anda.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: PANDUAN PENCEGAHAN BENCANA */}
        <section>
          <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <ShieldCheck size={14} /> Panduan Mitigasi (SOP)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sopBencana.map((item, idx) => (
              <div key={idx} className="bg-slate-900/30 border border-slate-800 p-8 rounded-[3rem] hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-slate-800 rounded-2xl">{item.icon}</div>
                  <h4 className="font-black text-sm text-white uppercase">{item.title}</h4>
                </div>
                <ul className="space-y-3">
                  {item.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-3 text-[11px] text-slate-400 font-bold">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: KONTAK DARURAT JABAR */}
        <section className="bg-blue-600 rounded-[3rem] p-10 flex flex-wrap justify-between items-center gap-8 shadow-2xl shadow-blue-600/20">
          <div className="max-w-md">
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Siaga 24 Jam</h4>
            <p className="text-xs text-blue-100 font-bold leading-relaxed">
              Jika Anda berada dalam situasi kritis yang memerlukan bantuan segera, hubungi pusat komando darurat Jawa Barat.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="tel:112" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all uppercase tracking-widest text-[10px]">
              <PhoneCall size={18} /> Call Center 112
            </a>
            <p className="text-[8px] text-center text-blue-200 font-black uppercase tracking-widest italic tracking-widest">Layanan Bebas Pulsa</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EducationDashboard;