import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Sub-components ────────────────────────────────────────────────────────────

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

const FeatureCard = memo(({ icon, title, desc, colorClass }) => (
  <div className="glass-card p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group hover:border-primary/30 transition-all duration-500">
    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${colorClass}`} />
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner ${colorClass.replace('bg-', 'text-').replace('-500', '-400')} ${colorClass}/10`}>
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <h4 className="font-display text-lg font-black text-on-surface uppercase tracking-tight mb-3 transition-colors group-hover:text-primary">{title}</h4>
      <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-70">
        {desc}
      </p>
    </div>
  </div>
));

const SopCard = memo(({ icon, title, steps, colorHex }) => (
  <div className="glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-300">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-inner" style={{ color: colorHex }}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <h4 className="font-display text-sm font-black text-on-surface uppercase tracking-tighter leading-tight">{title}</h4>
    </div>
    <ul className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-4">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: colorHex }} />
          <p className="text-[11px] text-on-surface-variant font-bold leading-relaxed opacity-80">{step}</p>
        </li>
      ))}
    </ul>
  </div>
));

const EducationDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('intro');

  const sopBencana = [
    {
      title: "Gempa Bumi (Siaga & Evakuasi)",
      icon: "earthquake",
      colorHex: "#fb923c", // orange-400
      steps: [
        "Tetap tenang. Merunduk, lindungi kepala dan leher (Drop, Cover, Hold on).",
        "Berlindung di bawah meja yang kokoh atau merapat ke dinding bagian dalam.",
        "Jauhi kaca, jendela, lemari, dan benda-benda berat yang berpotensi jatuh.",
        "Gunakan tangga darurat, jangan lift. Evakuasi ke titik kumpul terbuka."
      ]
    },
    {
      title: "Banjir & Luapan Air",
      icon: "flood",
      colorHex: "#38bdf8", // sky-400
      steps: [
        "Pindahkan barang berharga dan dokumen penting ke tempat yang lebih tinggi.",
        "Matikan aliran listrik utama dan cabut semua peralatan dari stopkontak.",
        "Segera menuju Safe Zone terdekat jika air terus meninggi.",
        "Jangan menerjang arus air yang deras, sekecil apapun kedalamannya."
      ]
    },
    {
      title: "Tanah Longsor",
      icon: "landscape",
      colorHex: "#10b981", // emerald-500
      steps: [
        "Waspadai curah hujan tinggi yang berdurasi lama di area lereng.",
        "Perhatikan tanda retakan tanah atau gemuruh dari perbukitan.",
        "Segera tinggalkan area rumah menuju titik aman yang stabil.",
        "Hindari lembah dan jalur sungai selama terjadi ancaman longsor."
      ]
    },
    {
      title: "Kebakaran Permukiman",
      icon: "local_fire_department",
      colorHex: "#ef4444", // red-500
      steps: [
        "Segera bunyikan alarm atau berteriak 'Kebakaran!' untuk memperingatkan warga.",
        "Gunakan kain basah untuk menutup hidung/mulut saat melewati asap.",
        "Merangkaklah di lantai karena udara bersih berada di lapisan bawah.",
        "Prioritaskan evakuasi nyawa di atas harta benda saat api membesar."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-32 pt-20 relative overflow-x-hidden">
      {/* Background Deco */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-0 left-0 w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-on-surface-variant opacity-60 hover:opacity-100 mb-4 transition-opacity text-sm group"
            >
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
              <span className="font-bold">Kembali ke Dashboard</span>
            </button>
            <h1 className="font-display text-3xl md:text-5xl font-black text-on-surface tracking-tighter leading-none mb-2">
              Pusat Literasi <span className="text-primary italic">SafeTana</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">
              Mitigasi Bencana & Pengenalan Sistem Keamanan
            </p>
          </div>

          {/* Premium Segmented Control */}
          <div className="glass-card p-1.5 rounded-[1.5rem] flex items-center bg-white/5 border border-white/5 shadow-inner">
            <button 
              onClick={() => setActiveTab('intro')}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'intro' ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant opacity-50 hover:opacity-100'}`}
            >
              Pengenalan
            </button>
            <button 
              onClick={() => setActiveTab('mitigasi')}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'mitigasi' ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant opacity-50 hover:opacity-100'}`}
            >
              Mitigasi
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        
        {activeTab === 'intro' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-right duration-700">
            {/* Hero Quote */}
            <section className="glass-card p-8 md:p-12 rounded-[3rem] border-t border-white/10 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
               <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                 <span className="material-symbols-outlined text-4xl text-primary opacity-30">format_quote</span>
                 <h3 className="font-display text-2xl md:text-3xl font-black text-on-surface tracking-tight leading-relaxed italic">
                   "Ketangguhan bukan sekadar bertahan, tapi bagaimana kita siap menghadapi dan pulih dari tantangan."
                 </h3>
                 <p className="text-sm font-medium text-on-surface-variant opacity-70 leading-relaxed max-w-2xl mx-auto">
                   SafeTana hadir sebagai jembatan informasi kritis yang membekali Anda dengan pengetahuan esensial. Kami mengintegrasikan teknologi pemantauan real-time dengan panduan protokol resmi untuk meminimalisir risiko bagi Anda dan keluarga.
                 </p>
               </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard 
                icon="verified_user" 
                title="Kesiapsiagaan Dini" 
                desc="Bencana seringkali datang tanpa peringatan. Memahami langkah mitigasi dan mengenali rute evakuasi (Safe Zone) adalah pertahanan pertama yang paling efektif."
                colorClass="bg-emerald-500"
              />
              <FeatureCard 
                icon="analytics" 
                title="Akurasi Data Lokal" 
                desc="Sistem kami memetakan aktivitas seismik, prakiraan cuaca regional, dan kualitas udara secara spesifik untuk meningkatkan kewaspadaan spasial warga."
                colorClass="bg-primary"
              />
              <FeatureCard 
                icon="hub" 
                title="Protokol Terpadu" 
                desc="Seluruh prosedur keselamatan yang kami sajikan diselaraskan dengan standar operasional dari otoritas penanggulangan bencana (BPBD/BNPB)."
                colorClass="bg-amber-500"
              />
              <FeatureCard 
                icon="psychology" 
                title="Dukungan Mental" 
                desc="Klinik AI kami menyediakan bantuan psikologis dasar untuk membantu warga mengelola stres dan trauma pasca-bencana secara privat."
                colorClass="bg-indigo-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-left duration-700">
            <SectionTitle icon="clinical_notes" title="Prosedur Operasi Standar" subtitle="Langkah Penyelamatan Diri & Mitigasi" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sopBencana.map((sop, i) => (
                <SopCard key={i} {...sop} />
              ))}
            </div>

            {/* Emergency CTA Banner */}
            <section className="relative overflow-hidden group">
               <div className="absolute inset-0 bg-primary/90 group-hover:bg-primary transition-colors duration-500 rounded-[3rem] shadow-2xl shadow-primary/20" />
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
               
               <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="max-w-md text-center md:text-left">
                   <h4 className="font-display text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4 italic">Garis Depan Keselamatan</h4>
                   <p className="text-sm font-bold text-white/70 uppercase tracking-widest leading-relaxed">
                     Layanan darurat terpadu tersedia 24/7. Segera hubungi petugas untuk bantuan evakuasi atau laporan kritis.
                   </p>
                 </div>
                 
                 <div className="flex flex-col items-center gap-3">
                   <a 
                     href="tel:112" 
                     className="bg-white text-primary px-10 py-5 rounded-3xl font-display font-black text-lg flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                   >
                     <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>phone_in_talk</span>
                     CALL CENTER 112
                   </a>
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                     <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Layanan Bebas Pulsa</span>
                   </div>
                 </div>
               </div>
            </section>
          </div>
        )}

        {/* Footer info */}
        <div className="glass-card rounded-2xl p-6 flex items-start gap-4 border border-white/5 opacity-50">
          <span className="material-symbols-outlined text-on-surface-variant opacity-60 mt-0.5">verified</span>
          <p className="text-[10px] text-on-surface-variant font-bold leading-relaxed uppercase tracking-wider">
            Materi edukasi disusun oleh tim SafeTana berdasarkan referensi teknis otoritas kebencanaan. Konten ini bertujuan sebagai referensi literasi umum dan tidak menggantikan instruksi langsung dari komandan lapangan saat terjadi bencana.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EducationDashboard;