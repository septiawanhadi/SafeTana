import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Pill, Search } from 'lucide-react';
import kamusData from '../../kamusData.json';

const HealthDictionary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('penyakit'); // 'penyakit' or 'obat'
  const [activeLetter, setActiveLetter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const currentData = activeTab === 'penyakit' ? kamusData.penyakit : kamusData.obat;

  const filteredData = currentData.filter((item) => {
    const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const itemFirstLetter = item.abjad ? item.abjad.toUpperCase() : item.nama.charAt(0).toUpperCase();
    const matchesLetter = activeLetter === 'all' || itemFirstLetter === activeLetter;
    return matchesSearch && matchesLetter;
  });

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
           <h1 className="text-lg font-bold">Kamus Kesehatan</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* HERO */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white shadow-lg mb-8">
           <h1 className="text-3xl sm:text-4xl font-black mb-3">Kamus Kesehatan</h1>
           <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
             Temukan informasi lengkap mengenai penyakit dan obat-obatan dari database tepercaya kami.
           </p>
        </div>

        {/* CONTENT */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          
          {/* TABS */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-6">
             <button 
               onClick={() => { setActiveTab('penyakit'); setActiveLetter('all'); setSearchQuery(''); }}
               className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition ${activeTab === 'penyakit' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
                <Stethoscope size={18} />
                Daftar Penyakit
             </button>
             <button 
               onClick={() => { setActiveTab('obat'); setActiveLetter('all'); setSearchQuery(''); }}
               className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition ${activeTab === 'obat' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
                <Pill size={18} />
                Daftar Obat
             </button>
          </div>

          {/* SEARCH */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={`Cari ${activeTab === 'penyakit' ? 'penyakit' : 'obat'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>

          {/* A-Z FILTER */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
             <button
               onClick={() => setActiveLetter('all')}
               className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${activeLetter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
             >
               Semua
             </button>
             {alphabet.map((letter) => (
               <button
                 key={letter}
                 onClick={() => setActiveLetter(letter)}
                 className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition ${activeLetter === letter ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
               >
                 {letter}
               </button>
             ))}
          </div>

          {/* LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <div key={index} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors group cursor-pointer">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.nama}
                  </h3>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-slate-500">
                Tidak ada data ditemukan untuk pencarian ini.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default HealthDictionary;
