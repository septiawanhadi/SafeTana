import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const HealthDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      if (window.confirm('Keluar dari layanan kesehatan?')) {
        await signOut(auth);
        navigate('/');
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-28">
      <main className="pt-24 px-6 max-w-4xl mx-auto space-y-8">
        
        {/* Profile & Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="font-display text-4xl text-on-surface leading-tight tracking-tighter">
              Aman, {user ? (user.displayName || user.email.split('@')[0]) : 'Sobat SafeTana'}
            </h2>
            <p className="text-on-surface-variant font-medium opacity-80 uppercase tracking-[0.2em] text-[10px]">
              {user ? 'Verified Citizen Account' : 'Guest Health Access'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/10 shadow-sm">
            {user ? (
               <>
                 <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-headline font-black text-xl border border-primary/20">
                   {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                 </div>
                 <div className="pr-4">
                   <p className="text-xs font-black text-on-surface uppercase tracking-widest leading-none mb-1">Health Profile</p>
                   <button onClick={handleLogout} className="text-[10px] text-error font-bold uppercase tracking-widest hover:underline">Log Out</button>
                 </div>
               </>
            ) : (
              <button 
                onClick={() => navigate('/health/auth')}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </section>

        {/* Hero Banner Bento */}
        <section className="relative glass-card rounded-lg p-8 overflow-hidden group min-h-[220px] flex flex-col justify-center border-l-4 border-primary shadow-xl">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
             <span className="material-symbols-outlined text-[12rem]">clinical_notes</span>
           </div>
           <div className="relative z-10 space-y-4 max-w-md">
             <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
               <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI Enhanced Diagnostic
             </div>
             <h1 className="text-3xl font-headline font-black text-on-surface leading-none tracking-tight">Kesehatan Digital di Tangan Anda.</h1>
             <p className="text-on-surface-variant text-sm font-medium leading-relaxed opacity-80">
               Chatbot medis 24/7 dan rekam medis digital yang terenkripsi untuk keamanan data Anda.
             </p>
           </div>
        </section>

        {/* Services Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Service 1: AI Chat */}
           <div 
             onClick={() => user ? navigate('/health/chat') : navigate('/health/auth')}
             className="col-span-2 glass-card rounded-lg p-6 flex flex-col justify-between aspect-square md:aspect-auto md:h-64 cursor-pointer active:scale-[0.98] transition-all hover:bg-white/5 shadow-lg"
           >
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-xl text-on-surface tracking-tight mb-1">Tanya AI</h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tight opacity-70">Symptom Checker</p>
              </div>
           </div>

           {/* Service 2: Screening */}
           <div 
             onClick={() => user ? navigate('/health/screening') : navigate('/health/auth')}
             className="glass-card rounded-lg p-5 flex flex-col justify-between aspect-square cursor-pointer active:scale-[0.98] transition-all hover:bg-white/5 border-emerald-500/20 shadow-md"
           >
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <span className="material-symbols-outlined">health_metrics</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface text-sm tracking-tight leading-none">Skrining</h3>
           </div>

           {/* Service 3: Konseling */}
           <div 
             onClick={() => user ? navigate('/health/mood') : navigate('/health/auth')}
             className="glass-card rounded-lg p-5 flex flex-col justify-between aspect-square cursor-pointer active:scale-[0.98] transition-all hover:bg-white/5 border-purple-500/20 shadow-md"
           >
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="font-headline font-bold text-on-surface text-sm tracking-tight leading-none">Konseling</h3>
           </div>

           {/* Full Width Info Link */}
           <div 
             onClick={() => navigate('/health/dictionary')}
             className="col-span-2 md:col-span-4 bg-tertiary/10 border border-tertiary/20 rounded-lg p-5 flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-transform"
           >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-tertiary/20 rounded-xl text-tertiary">
                   <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                  <h4 className="font-headline font-black text-on-surface uppercase text-xs tracking-widest">Medical Dictionary</h4>
                  <p className="text-[10px] text-on-surface-variant font-medium opacity-80">Pelajari penyakit & obat dari sumber tepercaya.</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-tertiary group-hover:translate-x-1 transition-transform">arrow_forward</span>
           </div>
        </section>

        {/* Daily Insight Cell */}
        <section className="glass-card rounded-lg p-6 bg-surface-container-highest/20">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
             <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Bio-Metric Sync</span>
          </div>
          <p className="text-on-surface font-headline font-bold text-lg leading-tight tracking-tight mb-2">
            "Your rest period was 15% more effective yesterday. Maintain this sleep window for peak disaster response readiness."
          </p>
          <div className="h-1 bg-outline-variant/20 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-gradient-to-r from-secondary to-tertiary" />
          </div>
        </section>

      </main>
    </div>
  );
};

export default HealthDashboard;
