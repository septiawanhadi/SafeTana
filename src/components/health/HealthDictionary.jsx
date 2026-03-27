import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import kamusData from '../../kamusData.json';

const HealthDictionary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('penyakit'); // 'penyakit' or 'obat'
  const [searchQuery, setSearchQuery] = useState('');

  const currentData = activeTab === 'penyakit' ? kamusData.penyakit : kamusData.obat;

  const filteredData = currentData.filter((item) => {
    return item.nama.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [
    { id: 'all', label: 'All Topics', active: true },
    { id: 'firstaid', label: 'First Aid' },
    { id: 'mental', label: 'Mental Health' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'prep', label: 'Preparedness' },
  ];

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-28">
      {/* Hero Section & Search */}
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        <section className="mb-10">
          <h2 className="font-display text-4xl text-on-surface leading-tight mb-2 tracking-tighter">Kamus Kesehatan</h2>
          <p className="text-on-surface-variant font-medium mb-6 opacity-80">Expert medical insights and disaster preparedness at your fingertips.</p>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all placeholder:text-outline-variant shadow-sm"
              placeholder={`Search ${activeTab === 'penyakit' ? 'diseases' : 'medicines'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Categories horizontal scroll */}
        <section className="mb-10 -mx-6 px-6 overflow-x-auto no-scrollbar flex gap-3">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 ${
                cat.active 
                  ? 'bg-gradient-to-br from-[#c3c0ff] to-[#d0bcff] text-[#1d00a5] shadow-lg shadow-primary/20' 
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </section>

        {/* Bento Grid Dictionary */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hero Bento Cell: Tab Toggle */}
          <div className="col-span-2 glass-card rounded-lg p-6 flex flex-col justify-between min-h-[180px] relative overflow-hidden group active:scale-[0.99] transition-transform">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {activeTab === 'penyakit' ? 'stethoscopes' : 'medication'}
              </span>
            </div>
            <div>
              <div className="flex bg-black/20 p-1 rounded-xl w-fit mb-4">
                <button 
                  onClick={() => setActiveTab('penyakit')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'penyakit' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-white'}`}
                >
                  Penyakit
                </button>
                <button 
                   onClick={() => setActiveTab('obat')}
                   className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'obat' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-white'}`}
                >
                  Obat
                </button>
              </div>
              <h3 className="font-headline font-black text-2xl text-on-surface mb-2 tracking-tight">
                {activeTab === 'penyakit' ? 'Daftar Penyakit' : 'Database Obat'}
              </h3>
              <p className="text-on-surface-variant text-xs line-clamp-2 font-medium opacity-80">
                Informasi detail mengenai diagnosis, gejala, dan penggunaan farmakologis yang tepat.
              </p>
            </div>
            <div className="flex items-center gap-2 text-tertiary font-black text-[10px] mt-4 uppercase tracking-widest">
              Explore Intelligence <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Featured Cards */}
          <div className="glass-card rounded-lg p-5 flex flex-col gap-4 active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#14B8A6]/20 flex items-center justify-center text-[#14B8A6] border border-[#14B8A6]/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>healing</span>
            </div>
            <div>
              <h4 className="font-headline font-black text-on-surface tracking-tight">Basic First Aid</h4>
              <p className="text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-tight opacity-70">12 Essential Tips</p>
            </div>
          </div>

          <div className="glass-card rounded-lg p-5 flex flex-col gap-4 active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-secondary border border-secondary/20">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h4 className="font-headline font-black text-on-surface tracking-tight">Mental Health</h4>
              <p className="text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-tight opacity-70">Stress Management</p>
            </div>
          </div>

          {/* Dictionary Items Grid */}
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {filteredData.slice(0, 10).map((item, index) => (
              <div 
                key={index} 
                className="glass-card rounded-lg p-4 flex items-center justify-between hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer border-outline-variant/10 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-headline font-bold text-on-surface text-sm">{item.nama}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-sm">chevron_right</span>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-50">
                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p className="font-headline font-bold text-sm tracking-tight">No results found for your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Tip Section */}
        <section className="mt-10 mb-6">
          <div className="bg-surface-container-low rounded-lg p-6 border-l-4 border-tertiary shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-tertiary">lightbulb</span>
              <span className="text-tertiary font-black text-[10px] uppercase tracking-[0.2em]">Guardian Insight</span>
            </div>
            <p className="text-on-surface font-headline font-bold leading-relaxed italic text-sm">
              "Regular hydration isn't just about thirst; it's the foundation of cognitive resilience during high-stress disaster scenarios."
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HealthDictionary;
