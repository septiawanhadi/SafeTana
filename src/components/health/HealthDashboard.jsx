import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { satuSehatService } from '../../services/health/satuSehatService';
import { bpjsService } from '../../services/health/bpjsService';
import { dataService } from '../../services/health/dataService';

const HealthDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestScreening, setLatestScreening] = useState(null);
  const [satuSehatStatus, setSatuSehatStatus] = useState({ status: 'checking' });
  const [bpjsStatus, setBpjsStatus] = useState({ status: 'checking' });
  const [checkingBpjs, setCheckingBpjs] = useState(false);
  const [bpjsResult, setBpjsResult] = useState(null);
  const [checkingSarana, setCheckingSarana] = useState(false);
  const [saranaResult, setSaranaResult] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Integration: Fetch latest screening
          const latest = await dataService.healthScreenings.fetchLatest(currentUser.uid);
          setLatestScreening(latest);
        } catch (err) {
          console.error("Gagal mengambil data skrining terbaru:", err);
        }
      }
      setLoading(false);
    });

    // Check Connections
    const checkConnections = async () => {
      const ssStatus = await satuSehatService.checkConnection();
      setSatuSehatStatus(ssStatus);
      
      const bStatus = await bpjsService.checkConnection();
      setBpjsStatus(bStatus);
    };
    checkConnections();

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Baru Saja';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };

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
      <main className="pt-20 pb-32 px-4 sm:pt-24 sm:px-6 max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
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

        {/* Latest Health Status Card */}
        {latestScreening && (
           <section 
             onClick={() => navigate('/health/screening')}
             className="glass-card rounded-[2.5rem] p-7 border border-outline-variant/10 shadow-lg relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all bg-surface-container-low/30"
           >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-4xl">arrow_right_alt</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 border-2 shadow-inner ${
                    latestScreening.assessment?.riskLevel === 'Tinggi' ? 'bg-error/10 text-error border-error/10' : 
                    latestScreening.assessment?.riskLevel === 'Sedang' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' : 'bg-success/10 text-success border-success/10'
                  }`}>
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {latestScreening.assessment?.riskLevel === 'Tinggi' ? 'warning' : 'verified_user'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-50 mb-1">Status Kesehatan Terkini</h3>
                    <div className="flex items-center gap-3">
                       <p className="text-2xl font-headline font-black text-on-surface tracking-tight">Risiko {latestScreening.assessment?.riskLevel}</p>
                       <span className="w-1.5 h-1.5 rounded-full bg-on-surface/10" />
                       <p className="text-xs font-bold text-on-surface-variant opacity-70 italic">{formatDate(latestScreening.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 sm:pr-6 border-t sm:border-t-0 sm:border-l border-outline-variant/10 pt-4 sm:pt-0 sm:pl-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">BMI Score</span>
                    <span className="text-2xl font-headline font-black text-on-surface">{latestScreening.assessment?.imt?.toFixed(1) || '--'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mb-1">Tekanan Darah</span>
                    <span className="text-2xl font-headline font-black text-on-surface">
                      {latestScreening.inputData?.sistolik || '--'}/{latestScreening.inputData?.diastolik || '--'}
                    </span>
                  </div>
                </div>
              </div>
           </section>
        )}

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

        {/* National Health Integration Status */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div 
             onClick={() => navigate('/health/fasyankes')}
             className="glass-card rounded-[2rem] p-5 border border-outline-variant/10 flex items-center justify-between flex-wrap gap-4 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all group"
           >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${satuSehatStatus.status === 'connected' ? 'bg-success/10 text-success' : 'bg-on-surface/5 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">health_and_safety</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50">SatuSehat Kemenkes</h4>
                  <p className="text-xs font-bold">
                    {satuSehatStatus.status === 'connected' ? 'Terhubung (Sandbox)' : 'Belum Terhubung'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-black bg-primary text-on-primary px-3 py-1 rounded-full uppercase tracking-widest group-hover:scale-105 transition-transform shadow-md flex items-center gap-1">
                  Direktori <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${satuSehatStatus.status === 'connected' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-on-surface/20'}`} />
              </div>
           </div>

           <div className={`glass-card rounded-[2rem] p-5 border border-outline-variant/10 flex items-center justify-between ${bpjsStatus.status === 'unconfigured' ? 'opacity-50 grayscale' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bpjsResult?.active ? 'bg-success/10 text-success' : 'bg-on-surface/5 text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50">BPJS Kesehatan</h4>
                  <p className="text-xs font-bold">
                    {bpjsResult ? `Status: ${bpjsResult.label}` : (bpjsStatus.status === 'ready' ? 'Siap Cek Status' : 'Belum Terkonfigurasi')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {bpjsStatus.status === 'ready' && !bpjsResult && (
                  <button 
                    onClick={() => {
                      const nik = window.prompt("Masukkan NIK untuk cek status BPJS:");
                      if (nik) {
                        setCheckingBpjs(true);
                        bpjsService.getStatusByNIK(nik)
                          .then(setBpjsResult)
                          .catch(err => alert(err.message))
                          .finally(() => setCheckingBpjs(false));
                      }
                    }}
                    disabled={checkingBpjs}
                    className="text-[10px] font-black bg-primary text-on-primary px-3 py-1 rounded-full uppercase tracking-widest"
                  >
                    {checkingBpjs ? '...' : 'Cek'}
                  </button>
                )}
                <div className={`w-2 h-2 rounded-full ${bpjsStatus.status === 'ready' ? (bpjsResult?.active ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500') : 'bg-on-surface/20'}`} />
              </div>
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
