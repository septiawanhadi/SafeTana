import React, { useState } from 'react';
import { Eye, Rocket, ShieldCheck, ChevronRight, CheckCircle } from 'lucide-react';

const OnboardingScreen = ({ onDone }) => {
  const [slide, setSlide] = useState(0);

  const handleNext = () => {
    if (slide < 1) setSlide(1);
    else onDone();
  };

  return (
    <div className="fixed inset-0 z-[99998] bg-background flex flex-col items-center overflow-y-auto px-6 py-12 no-scrollbar">
      {/* Slide indicator */}
      <div className="flex gap-2 mb-6">
        <span className={`h-2 rounded-full transition-all duration-300 ${slide === 0 ? 'w-6 bg-primary' : 'w-2 bg-surface-container-highest'}`} />
        <span className={`h-2 rounded-full transition-all duration-300 ${slide === 1 ? 'w-6 bg-primary' : 'w-2 bg-surface-container-highest'}`} />
      </div>

      {/* ───── SLIDE 0 — TENTANG KAMI ───── */}
      <div className={`w-full max-w-md flex flex-col items-center pb-32 ${slide === 0 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
        {/* Hero */}
        <div className="text-center mb-8 mt-2">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6 p-3">
            <img src="/logo.png" alt="SafeTana AI Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-4xl font-black text-on-background tracking-tighter mb-2">
            Safe<span className="text-error">Tana</span><span className="text-primary ml-1 text-2xl align-super">AI</span>
          </h1>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] opacity-80 max-w-[250px] mx-auto leading-relaxed">
            Cerdas berbagi, siap mitigasi & peduli kesehatan
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 w-full mb-8">
          <div className="glass-card p-6 rounded-2xl shadow-lg border-t border-white/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
              <Eye size={24} />
            </div>
            <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-widest mb-2">Visi Kami</h3>
            <p className="text-on-surface-variant text-[11px] font-medium leading-relaxed opacity-80">
              Menjadi platform keamanan dan kesehatan digital terdepan yang memberikan
              dampak perlindungan preventif berkelanjutan bagi masyarakat di area rawan krisis.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl shadow-lg border-t border-white/5">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success mb-4 shadow-inner">
              <Rocket size={24} />
            </div>
            <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-widest mb-2">Misi Kami</h3>
            <ul className="text-on-surface-variant text-[11px] font-medium leading-relaxed space-y-2 opacity-80 list-disc list-inside">
              <li>Deteksi dini bencana & peringatan berbasis lokasi.</li>
              <li>Pemetaan titik aman (Safe Zone) geospasial.</li>
              <li>Ekosistem kesehatan prediktif berbasis AI.</li>
            </ul>
          </div>
        </div>

        {/* Developers */}
        <div className="flex flex-col gap-3 w-full mt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-50 text-center mb-1">Developed By</p>
          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 overflow-hidden shadow-xl p-0.5 bg-background">
                <img src="/Septi.png" alt="Septi" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-on-surface leading-none mb-1">Septiawan Hadi</p>
                <p className="text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Lead Dev</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-tertiary/30 overflow-hidden shadow-xl p-0.5 bg-background">
                <img src="/Restu.png" alt="Restu" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-on-surface leading-none mb-1">Restu Utami</p>
                <p className="text-[7.5px] font-bold text-on-surface-variant opacity-60 uppercase tracking-[0.2em]">Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── SLIDE 1 — PEMBERITAHUAN PRIVASI ───── */}
      <div className={`w-full max-w-md flex flex-col items-center pb-32 ${slide === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
        <div className="text-center mb-10 mt-6">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20 shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h2 className="font-display text-4xl font-black text-on-surface tracking-tighter leading-none mb-3">Privacy Protocol</h2>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Verified Safety Standards</p>
        </div>

        <div className="space-y-4 w-full">
          {[
            { 
              title: "Data Collection", 
              desc: "Identity, health metrics, and real-time location for emergency response.",
              icon: "database"
            },
            { 
              title: "Usage Protocol", 
              desc: "Providing AI assistance, hazard detection, and predictive health insights.",
              icon: "security"
            },
            { 
              title: "Encryption", 
              desc: "All data is protected by industry-standard Firebase security & TLS encryption.",
              icon: "lock"
            }
          ].map((item, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl flex gap-5 items-center border border-white/5 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-on-surface text-[11px] uppercase tracking-widest mb-1">{item.title}</h4>
                <p className="text-on-surface-variant text-[11px] font-medium leading-relaxed opacity-70">{item.desc}</p>
              </div>
            </div>
          ))}
          
          <div className="mt-8 p-6 glass-card rounded-2xl border-l-4 border-error/50 bg-error/5 text-center shadow-lg">
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface">
               Your safety is our only mission.
             </p>
             <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mt-1">
               We never sell your data.
             </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 flex flex-col items-center pointer-events-none z-50">
        <button 
          className="w-full max-w-md bg-white text-background hover:bg-surface-variant hover:scale-105 active:scale-95 font-black py-4 rounded-2xl shadow-2xl flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px] pointer-events-auto transition-all" 
          onClick={handleNext}
        >
          {slide === 0 ? (
            <>Selanjutnya <ChevronRight size={16} /></>
          ) : (
            <><CheckCircle size={16} /> Saya Setuju & Mulai</>
          )}
        </button>
        {slide === 0 && (
          <button 
            className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-50 hover:opacity-100 transition-opacity pointer-events-auto" 
            onClick={onDone}
          >
            Lewati Onboarding
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
