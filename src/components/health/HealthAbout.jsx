import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Rocket } from 'lucide-react';

const HealthAbout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
           <button 
            onClick={() => navigate('/health')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
           >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
           </button>
           <h1 className="text-lg font-bold">Tentang Kami</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-32">
        
        {/* HERO */}
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-16 text-center text-white shadow-xl mb-8 relative overflow-hidden">
           <div className="relative z-10 max-w-2xl mx-auto">
             <h1 className="text-3xl sm:text-4xl font-black mb-4">Tentang SafeTana AI</h1>
             <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
               Misi kami adalah mendemokratisasi akses keamanan mitigasi bencana & prediktif kesehatan bagi seluruh masyarakat Indonesia melalui teknologi mutakhir.
             </p>
           </div>
           
           <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12">
             {/* Abstract geometric decoration */}
             <div className="w-64 h-64 bg-white rounded-full blur-3xl"></div>
           </div>
        </div>

        {/* VISION & MISSION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <Eye size={24} />
             </div>
             <h2 className="text-xl font-bold mb-3">Visi Kami</h2>
             <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
               Menjadi platform keamanan dan kesehatan digital terdepan dan terpercaya yang memberikan dampak perlindungan preventif dan positif berkelanjutan bagi kualitas hidup masyarakat di area rawan krisis.
             </p>
           </div>
           
           <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                <Rocket size={24} />
             </div>
             <h2 className="text-xl font-bold mb-3">Misi Kami</h2>
             <ul className="text-slate-600 dark:text-slate-400 leading-relaxed list-disc pl-5 space-y-2">
                 <li>Memberikan akses layanan deteksi dini kesehatan dan peringatan dini bencana yang cepat dan akurat.</li>
                 <li>Menyediakan peta informasi titik aman / Safe Zone yang real-time berbasis geospasial.</li>
                 <li>Membangun ekosistem digital mandiri dengan bantuan kecerdasan buatan cerdas bernama SafeTanaBot.</li>
             </ul>
           </div>
        </div>

        {/* FOUNDERS */}
        <div className="text-center mb-12">
           <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Tim Developer</h2>
           <p className="text-slate-500 max-w-lg mx-auto mb-8">
             Inti dari platform tangguh ini dibangun oleh talenta yang berdedikasi.
           </p>

           <div className="flex flex-wrap justify-center gap-6">
             {/* Septi Card */}
             <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-xs transition-transform hover:-translate-y-2">
               <div className="w-24 h-24 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4 border-4 border-blue-100 dark:border-blue-900/30">
                 <img src="/Septi.png" alt="Septiawan Hadi Prasetyo" className="w-full h-full object-cover" />
               </div>
               <h4 className="font-bold text-lg mb-1 leading-tight text-slate-900 dark:text-white">Septiawan Hadi Prasetyo</h4>
               <span className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Developer</span>
             </div>

             {/* Restu Card */}
             <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-xs transition-transform hover:-translate-y-2">
               <div className="w-24 h-24 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4 border-4 border-emerald-100 dark:border-emerald-900/30">
                 <img src="/Restu.png" alt="Restu Utami" className="w-full h-full object-cover" />
               </div>
               <h4 className="font-bold text-lg mb-1 leading-tight text-slate-900 dark:text-white">Restu Utami</h4>
               <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Developer</span>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default HealthAbout;
