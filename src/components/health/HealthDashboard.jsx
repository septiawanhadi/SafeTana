import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, ClipboardList, Activity, ArrowRight,
  User, LogOut, ChevronLeft, Calendar
} from 'lucide-react';
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
        navigate('/'); // Kemabli ke safetana awal
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button 
              onClick={() => navigate('/')} 
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
             >
                <ChevronLeft size={24} className="text-slate-600 dark:text-slate-300" />
             </button>
             <div className="flex items-center gap-2">
               <span className="text-xl font-black tracking-tight"><span className="text-blue-600 dark:text-blue-400">SafeTana AI</span> Health</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                   <p className="text-sm font-bold leading-tight">{user.displayName || user.email.split('@')[0]}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Pasien Terdaftar</p>
                </div>
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex justify-center items-center font-bold border border-blue-200 dark:border-blue-800">
                   {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                  title="Keluar"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
               <button 
                  onClick={() => navigate('/health/auth')} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
               >
                 Masuk
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-8">
        
        {/* WELCOME BANNER */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10 w-full sm:w-2/3">
             <h1 className="text-2xl sm:text-3xl font-black mb-2">Solusi Kesehatan di Tanganmu</h1>
             <p className="text-blue-100 mb-6 text-sm sm:text-base leading-relaxed">
               Layanan mandiri pendeteksi gejala, pemantau mood, dan asisten AI pintar yang siap melayanimu 24 jam.
             </p>
             {!user && (
                 <button 
                    onClick={() => navigate('/health/auth')} 
                    className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform"
                 >
                   Daftar Sekarang
                 </button>
             )}
           </div>
           
           <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
              <Activity size={250} />
           </div>
        </section>

        {/* SERVICES GRID */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Layanan Utama</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* CARD 1: Chatbot */}
            <div 
              onClick={() => user ? navigate('/health/chat') : navigate('/health/auth')}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
            >
               <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
               </div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-1">Tanya SafeTanaBot</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                 Konsultasi gejala ringan dengan asisten AI kesehatan mandiri 24 jam.
               </p>
               <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider group-hover:gap-2 transition-all">
                  Mulai Chat <ArrowRight size={14} />
               </div>
            </div>

            {/* CARD 2: Skrining Fisik */}
            <div 
              onClick={() => user ? navigate('/health/screening') : navigate('/health/auth')}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group"
            >
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={24} className="text-emerald-600 dark:text-emerald-400" />
               </div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-1">Skrining Kesehatan</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                 Isi form asesmen diri untuk hipertensi, diabetes, dan gejala lainnya.
               </p>
               <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider group-hover:gap-2 transition-all">
                  Cek Sekarang <ArrowRight size={14} />
               </div>
            </div>

            {/* CARD 3: Mood Tracker */}
            <div 
              onClick={() => user ? navigate('/health/mood') : navigate('/health/auth')}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-3xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"
            >
               <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={24} className="text-purple-600 dark:text-purple-400" />
               </div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-1">Catat Mood 30 Hari</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                 Pelacak kesehatan mental harian agar Anda selalu termotivasi.
               </p>
               <div className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider group-hover:gap-2 transition-all">
                  Isi Jurnal <ArrowRight size={14} />
               </div>
            </div>

          </div>
        </section>

        {/* FOOTER SECTION */}
        <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <button onClick={() => navigate('/health/dictionary')} className="hover:text-blue-600 transition-colors">Kamus Kesehatan</button>
            <button onClick={() => navigate('/health/privacy')} className="hover:text-blue-600 transition-colors">Pemberitahuan Privasi</button>
            <button onClick={() => navigate('/health/terms')} className="hover:text-blue-600 transition-colors">Syarat & Ketentuan</button>
            <button onClick={() => navigate('/health/about')} className="hover:text-blue-600 transition-colors">Tentang Kami</button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} SafeTana AI Health. Hak Cipta Dilindungi.
          </p>
        </footer>

      </main>
    </div>
  );
};

export default HealthDashboard;
