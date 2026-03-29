import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import kamusData from '../../kamusData.json';
import { aiService } from '../../services/health/aiService';

const HealthDictionary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('penyakit'); // 'penyakit' or 'obat'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedTopic, setSelectedTopic] = useState(null); // { title: '', type: '' }
  const [topicDetails, setTopicDetails] = useState('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  const handleOpenDetail = async (title, type = 'Penyakit/Obat') => {
    setSelectedTopic({ title, type });
    setTopicDetails('');
    setIsLoadingDetails(true);
    
    try {
      // Call AI Service
      const details = await aiService.getDictionaryInfo(title, type);
      setTopicDetails(details);
    } catch (error) {
      setTopicDetails('Gagal memuat informasi medis dari server. Harap periksa koneksi internet Anda atau coba lagi nanti.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedTopic(null);
    setTopicDetails('');
  };

  // Helper to format bold text from markdown roughly
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      // Convert **text** to <strong>text</strong>
      const processedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-black text-on-surface">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <p key={i} className="mb-2 leading-relaxed">
          {processedLine}
        </p>
      );
    });
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-28">
      {/* Hero Section & Search */}
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <section className="mb-10">
          <button 
            onClick={() => navigate('/health')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 -ml-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </button>

          <h2 className="font-display text-4xl text-on-surface leading-tight mb-2 tracking-tighter">Kamus Kesehatan</h2>
          <p className="text-on-surface-variant font-medium mb-6 opacity-80 text-sm">Pusat informasi medis yang canggih & cerdas, didukung oleh AI untuk respon instan.</p>
          
          <div className="relative group shadow-lg rounded-2xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant outline-none"
              placeholder={`Cari informasi ${activeTab === 'penyakit' ? 'penyakit' : 'obat'}...`}
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
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 border ${
                cat.active 
                  ? 'bg-gradient-to-br from-[#c3c0ff] to-[#d0bcff] text-[#1d00a5] border-[#d0bcff] shadow-lg shadow-primary/20' 
                  : 'bg-surface-container-high text-on-surface border-outline-variant/10 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </section>

        {/* Bento Grid Dictionary */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hero Bento Cell: Tab Toggle */}
          <div className="col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[180px] relative overflow-hidden group shadow-md border-t border-outline-variant/10">
            <div className="absolute right-0 -top-4 opacity-10 blur-sm pointer-events-none">
              <span className="material-symbols-outlined text-[10rem]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {activeTab === 'penyakit' ? 'stethoscopes' : 'medication'}
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex bg-surface-container-highest p-1 rounded-xl w-fit mb-4 border border-outline-variant/5 shadow-inner">
                <button 
                  onClick={() => setActiveTab('penyakit')}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'penyakit' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Penyakit
                </button>
                <button 
                   onClick={() => setActiveTab('obat')}
                   className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'obat' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Obat
                </button>
              </div>
              <h3 className="font-headline font-black text-2xl text-on-surface mb-2 tracking-tight">
                {activeTab === 'penyakit' ? 'Daftar Penyakit' : 'Database Obat'}
              </h3>
              <p className="text-on-surface-variant text-xs line-clamp-2 font-medium opacity-80 max-w-[80%]">
                {activeTab === 'penyakit' 
                  ? 'Temukan gejala, penanganan pertama, dan informasi kritis untuk berbagai kondisi kesehatan.' 
                  : 'Pelajari komposisi, dosis, dan efek samping dari berbagai obat-obatan.'}
              </p>
            </div>
          </div>

          {/* Featured Cards */}
          <div 
            className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-6 active:scale-95 transition-transform hover:-translate-y-1 shadow-md cursor-pointer group"
            onClick={() => handleOpenDetail('Basic First Aid (Pertolongan Pertama)', 'Panduan Gawat Darurat')}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6] border border-[#14B8A6]/20 shadow-inner group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>healing</span>
            </div>
            <div>
              <h4 className="font-headline font-black text-on-surface tracking-tight text-lg">Pertolongan Pertama</h4>
              <p className="text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-tight opacity-70">12 Panduan Esensial</p>
            </div>
          </div>

          <div 
            className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-6 active:scale-95 transition-transform hover:-translate-y-1 shadow-md cursor-pointer group"
            onClick={() => handleOpenDetail('Mental Health (Manajemen Stres Pasca Bencana)', 'Kesehatan Mental')}
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary-container/20 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h4 className="font-headline font-black text-on-surface tracking-tight text-lg">Kesehatan Mental</h4>
              <p className="text-[10px] text-on-surface-variant mt-1 font-bold uppercase tracking-tight opacity-70">Manajemen Stres</p>
            </div>
          </div>

          {/* Dictionary Items Grid */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {filteredData.slice(0, 10).map((item, index) => (
              <div 
                key={index} 
                onClick={() => handleOpenDetail(item.nama, activeTab === 'penyakit' ? 'Penyakit Medis' : 'Obat Medis')}
                className="glass-card rounded-[1.2rem] p-4 flex items-center justify-between hover:bg-primary/5 hover:border-primary/20 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer border border-outline-variant/10 shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <span className="font-headline font-bold text-on-surface text-sm">{item.nama}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </div>
              </div>
            ))}
            
            {filteredData.length === 0 && (
              <div className="col-span-full py-16 text-center opacity-50 glass-card rounded-2xl border-dashed">
                <span className="material-symbols-outlined text-4xl mb-3 text-on-surface-variant">search_off</span>
                <p className="font-headline font-bold text-sm tracking-tight">Tidak ada hasil ditemukan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Tip Section */}
        <section className="mt-8 mb-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border-l-4 border-tertiary shadow-lg relative overflow-hidden">
             <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">lightbulb</span>
             </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="material-symbols-outlined text-tertiary">lightbulb</span>
              <span className="text-tertiary font-black text-[10px] uppercase tracking-[0.2em]">Guardian Insight</span>
            </div>
            <p className="text-on-surface font-headline font-bold leading-relaxed italic text-sm relative z-10">
              "Hidrasi yang cukup bukan hanya untuk menghilangkan dahaga; ia adalah fondasi ketahanan kognitif Anda dalam merespon situasi darurat bencana."
            </p>
          </div>
        </section>
      </main>

      {/* Detail Modal Overlay */}
      {selectedTopic && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 md:px-0">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={closeModal}
           ></div>
           
           {/* Modal Card */}
           <div className="bg-background w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
             
             {/* Handle bar for mobile */}
             <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
               <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full"></div>
             </div>

             {/* Header */}
             <div className="px-6 pb-4 pt-4 sm:pt-6 border-b border-outline-variant/10 flex items-start justify-between shrink-0">
                <div className="pr-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md mb-2 inline-block shadow-sm border border-primary/20">
                    {selectedTopic.type}
                  </span>
                  <h2 className="font-display text-2xl font-black text-on-surface tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-on-surface to-on-surface-variant">{selectedTopic.title}</h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:bg-error hover:text-white transition-all shadow-sm shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
             </div>

             {/* Body */}
             <div className="p-6 overflow-y-auto overflow-x-hidden text-sm text-on-surface-variant custom-scrollbar relative">
                {isLoadingDetails ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 relative mb-6">
                       <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                         <span className="material-symbols-outlined text-primary text-xl animate-pulse">neurology</span>
                       </div>
                    </div>
                    <p className="font-headline font-black text-sm text-on-surface tracking-tight animate-pulse">SafeTana AI sedang menganalisis...</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-70">Menarik dari basis data medis</p>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed max-w-none">
                     {formatText(topicDetails)}
                  </div>
                )}
             </div>
             
             {/* Footer Alert */}
             {!isLoadingDetails && (
               <div className="px-6 py-4 bg-error-container/20 border-t border-error/10 rounded-b-3xl">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-error-container text-center flex items-center justify-center gap-2">
                   <span className="material-symbols-outlined text-sm">warning</span> 
                   Disarankan konsultasi ke tenaga medis untuk detail rujukan
                 </p>
               </div>
             )}
             
           </div>
        </div>
      )}
    </div>
  );
};

export default HealthDictionary;

