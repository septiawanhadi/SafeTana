import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Integration: Service Pattern
import { aiService } from '../../services/health/aiService';
import { dataService } from '../../services/health/dataService';
import { useDynamicIsland } from '../../contexts/DynamicIslandContext';
import { COUNSELING_PLAYLIST } from '../../constants/health/counselingPlaylist.js';

const MOOD_EMOJIS = [
  { id: 'bersyukur', emoji: '🙏', label: 'Bersyukur', color: 'bg-emerald-100 text-emerald-600 border-emerald-300', score: 5 },
  { id: 'tenang', emoji: '😌', label: 'Tenang', color: 'bg-blue-100 text-blue-600 border-blue-300', score: 5 },
  { id: 'berusaha', emoji: '💪', label: 'Berjuang', color: 'bg-amber-100 text-amber-600 border-amber-300', score: 4 },
  { id: 'lelah', emoji: '😫', label: 'Lelah', color: 'bg-slate-100 text-slate-600 border-slate-300', score: 3 },
  { id: 'sedih', emoji: '😢', label: 'Sedih / Duka', color: 'bg-indigo-100 text-indigo-600 border-indigo-300', score: 2 },
  { id: 'trauma', emoji: '😰', label: 'Trauma / Takut', color: 'bg-purple-100 text-purple-600 border-purple-300', score: 1 }
];

const MoodTracker = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [moodLogs, setMoodLogs] = useState([]);
  const [stats, setStats] = useState({ totalLogs: 0, streak: 0, mostFrequent: null, averageScore: 0 });
  const [saving, setSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { playMusic, musicData } = useDynamicIsland();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [serverStatus, setServerStatus] = useState('online');

  const SEARCH_SOURCES = [
    { name: 'Piped Kavin', url: 'https://pipedapi.kavin.rocks/search?q=', type: 'piped' },
    { name: 'Piped Mha', url: 'https://api-piped.mha.fi/search?q=', type: 'piped' },
    { name: 'Piped Lunar', url: 'https://piped-api.lunar.icu/search?q=', type: 'piped' },
    { name: 'Invidious Puffyan', url: 'https://vid.puffyan.us/api/v1/search?q=', type: 'invidious' },
    { name: 'Invidious NoLogs', url: 'https://invidious.no-logs.com/api/v1/search?q=', type: 'invidious' },
    { name: 'Invidious Melmac', url: 'https://iv.melmac.space/api/v1/search?q=', type: 'invidious' },
    { name: 'Invidious Snopyta', url: 'https://invidious.snopyta.org/api/v1/search?q=', type: 'invidious' }
  ];

  const PROXY_CHANNELS = [
    '', // Priority 1: Direct Fetch
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://corsproxy.io/?'
  ];

  const fetchWithFallback = async (query) => {
    const encodedQuery = encodeURIComponent(query);
    
    for (const proxy of PROXY_CHANNELS) {
      for (const source of SEARCH_SOURCES) {
        try {
          const targetUrl = `${source.url}${encodedQuery}&type=video`;
          const finalUrl = proxy 
            ? proxy.includes('allorigins') ? `${proxy}${encodeURIComponent(targetUrl)}` : `${proxy}${targetUrl}`
            : targetUrl;

          const res = await fetch(finalUrl, { signal: AbortSignal.timeout(4000) });
          if (!res.ok) continue;

          const data = await res.json();
          let items = source.type === 'piped' ? (data.items || []) : (Array.isArray(data) ? data : []);

          if (items && items.length > 0) {
            return items.filter(i => source.type === 'piped' ? i.type === 'video' : true)
              .map(item => ({
                videoId: source.type === 'piped' ? item.url?.split('v=')?.[1] : item.videoId,
                title: item.title,
                artist: source.type === 'piped' ? item.uploaderName : item.author,
                cover: source.type === 'piped' ? item.thumbnail : (item.videoThumbnails?.[0]?.url || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`),
                duration: item.duration || item.lengthSeconds
              }))
              .filter(v => v.videoId);
          }
        } catch (err) {
          console.warn(`Channel failed: ${proxy || 'direct'} + ${source.name}`);
        }
      }
    }
    throw new Error('Semua kanal pencarian sedang sibuk. Silakan coba beberapa saat lagi.');
  };

  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const handlePlayCuratedSong = async (song) => {
    // Zero-API Optimization: Use pre-mapped ID if available
    if (song.videoId) {
      playMusic({
        videoId: song.videoId,
        title: song.title,
        artist: song.artist,
        cover: `https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`
      });
      return;
    }

    setLoadingTrackId(song.id);
    setServerStatus('online');
    try {
      const query = song.artist ? `${song.title} ${song.artist}` : song.title;
      const results = await fetchWithFallback(query);
      if (results && results.length > 0) {
        playMusic(results[0]);
      }
    } catch (err) {
      console.error('Gagal memutar lagu:', err);
      setServerStatus('error');
    } finally {
      setLoadingTrackId(null);
    }
  };

  const [showExternalFallback, setShowExternalFallback] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setServerStatus('online');
    setShowExternalFallback(false);
    try {
      const data = await fetchWithFallback(searchQuery);
      if (data && data.length > 0) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Cloud search error", err);
      setServerStatus('error');
      setShowExternalFallback(true);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchMoodLogs(currentUser.uid);
      } else {
        navigate('/health/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const calculateStats = (logs) => {
    if (logs.length === 0) return { totalLogs: 0, streak: 0, mostFrequent: null, averageScore: 0 };
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = logs.filter(log => {
      const logDate = log.timestamp ? log.timestamp.toDate() : new Date();
      return logDate >= thirtyDaysAgo;
    });
    const frequency = {};
    let totalScore = 0;
    recentLogs.forEach(log => {
      frequency[log.moodId] = (frequency[log.moodId] || 0) + 1;
      const moodDef = MOOD_EMOJIS.find(m => m.id === log.moodId);
      if (moodDef) totalScore += moodDef.score;
    });
    let topMoodId = null;
    let maxFreq = 0;
    for (const [id, count] of Object.entries(frequency)) {
      if (count > maxFreq) { maxFreq = count; topMoodId = id; }
    }
    const topMoodDef = MOOD_EMOJIS.find(m => m.id === topMoodId);
    const uniqueDays = new Set(recentLogs.map(log => {
      const d = log.timestamp ? log.timestamp.toDate() : new Date();
      return d.toDateString();
    })).size;
    const avgScore = recentLogs.length > 0 ? (totalScore / recentLogs.length) : 0;
    return { totalLogs: recentLogs.length, streak: uniqueDays, mostFrequent: topMoodDef, averageScore: avgScore };
  };

  const fetchMoodLogs = async (userId) => {
    try {
      const logs = await dataService.moodLogs.fetchAll(userId);
      setMoodLogs(logs);
      setStats(calculateStats(logs));
    } catch (err) {
      console.error("Gagal mengambil log mood:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood || !user) return;
    setSaving(true);
    try {
      const moodData = {
        moodId: selectedMood.id,
        moodLabel: selectedMood.label,
        emoji: selectedMood.emoji,
        note: note.trim()
      };
      await dataService.moodLogs.add(user.uid, moodData);
      setSelectedMood(null);
      setNote('');
      fetchMoodLogs(user.uid);
    } catch (err) {
      console.error("Gagal menyimpan mood:", err);
      alert('Gagal menyimpan catatan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (logId) => {
    if (window.confirm("Hapus catatan mood ini?")) {
      try {
        await dataService.moodLogs.delete(logId);
        const updatedLogs = moodLogs.filter(log => log.id !== logId);
        setMoodLogs(updatedLogs);
        setStats(calculateStats(updatedLogs));
      } catch (err) {
        console.error("Gagal menghapus mood:", err);
      }
    }
  };

  const getAIAnalysis = async () => {
    if (moodLogs.length < 1) {
      alert("Butuh setidaknya satu entri jurnal untuk dianalisis.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const analysisText = await aiService.analyzeMoodLogs(moodLogs);
      setAiAnalysis(analysisText);
    } catch (error) {
      console.error("SafeTana AI Analysis Error:", error);
      alert("Gagal terhubung dengan SafeTana AI. Periksa koneksi internet Anda atau coba lagi nanti.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-on-background font-body pb-20">
      <header className="glass-card shadow-sm sticky top-0 z-50 border-b border-outline-variant/20 relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-[-1]" />
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <button onClick={() => navigate('/health')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-purple-500">trending_up</span>
               <h1 className="font-headline font-black text-lg text-on-surface tracking-tight">Konseling & Jurnal</h1>
             </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-32 space-y-6">
        <section className="grid grid-cols-3 gap-3">
           <div className="glass-card p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-orange-500 mb-1 text-3xl">local_fire_department</span>
              <p className="text-2xl font-headline font-black">{stats.streak}</p>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Hari Aktif</p>
           </div>
           <div className="glass-card p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-1">{stats.mostFrequent ? stats.mostFrequent.emoji : '➖'}</span>
              <p className="text-sm font-bold truncate w-full">{stats.mostFrequent ? stats.mostFrequent.label : '-'}</p>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Sering Muncul</p>
           </div>
           <div className="glass-card p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
              <span className={`material-symbols-outlined text-3xl ${stats.averageScore >= 3 ? 'text-success' : 'text-error'} mb-1`}>vital_signs</span>
              <p className="text-2xl font-headline font-black">{stats.averageScore.toFixed(1)}/5</p>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Skor Rata-rata</p>
           </div>
        </section>

        <section className="glass-card p-1 rounded-[1.5rem] shadow-sm">
           <button 
             onClick={getAIAnalysis}
             disabled={isAnalyzing || moodLogs.length === 0}
             className="w-full flex items-center justify-between p-4 bg-primary/5 rounded-[1.3rem] group transition-all"
           >
              <div className="flex items-center gap-4 text-left">
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                 </div>
                 <div>
                    <h3 className="font-headline font-black text-sm text-on-surface tracking-tight">Analisis Mental AI</h3>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Dapatkan insight khusus</p>
                 </div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 group-hover:bg-primary group-hover:text-on-primary transition-all shadow-sm ${isAnalyzing ? 'animate-pulse' : ''}`}>
                 <span className={`material-symbols-outlined ${isAnalyzing ? 'animate-spin' : ''}`}>
                   {isAnalyzing ? 'autorenew' : 'auto_awesome'}
                 </span>
              </div>
           </button>
           
           {aiAnalysis && (
              <div className="p-6 border-t border-outline-variant/10 mt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[10px] font-black rounded uppercase">AI Insights</span>
                    <div className="h-px flex-1 bg-outline-variant/20"></div>
                 </div>
                 <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line font-medium">
                    {aiAnalysis}
                 </div>
                 <button onClick={() => setAiAnalysis(null)} className="mt-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors">Tutup Analisis</button>
              </div>
           )}
        </section>

        <section className="glass-card p-6 rounded-[2rem] shadow-sm border border-outline-variant/10">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                   <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_download</span>
                </div>
                <div>
                   <h3 className="font-headline font-black text-lg text-on-surface tracking-tight leading-none">Vibe Search Pro</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-none">Cloud Streaming</p>
                      <div className="flex items-center gap-1.5 bg-surface-container-high px-2 py-0.5 rounded-full border border-outline-variant/10">
                         <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-success animate-pulse' : 'bg-error'}`}></div>
                         <span className="text-[8px] font-black uppercase text-on-surface-variant tracking-wider">{serverStatus === 'online' ? 'Secure Proxy' : 'Reconnecting...'}</span>
                      </div>
                   </div>
                </div>
              </div>
           </div>

           <div className="relative mb-8">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Cari lagu apapun (Youtube/SoundCloud style)..." 
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4.5 px-6 pr-16 text-sm text-on-surface focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium placeholder:text-on-surface-variant/40"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-2 top-2 w-12 h-12 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-lg ${isSearching ? 'animate-spin' : ''}`}>
                  {isSearching ? 'progress_activity' : 'search'}
                </span>
              </button>
           </div>

           <div className="space-y-10">
              {showExternalFallback && (
                <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5 text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                    <span className="material-symbols-outlined text-3xl text-indigo-500">cloud_off</span>
                  </div>
                  <h4 className="font-headline font-black text-sm text-on-surface mb-2 tracking-tight">Koneksi Pencarian Sedang Sibuk</h4>
                  <p className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-widest leading-relaxed mb-6 px-4">Kami tidak dapat menemukan lagu secara otomatis saat ini. Silakan cari langsung di YouTube melalui tombol di bawah.</p>
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full md:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span> Buka di YouTube
                  </a>
                </div>
              )}

              {searchResults.length > 0 && (
                <div>
                   <div className="flex items-center justify-between mb-4 px-1">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Hasil Pencarian</h4>
                      <button onClick={() => setSearchResults([])} className="text-[9px] font-bold text-on-surface-variant uppercase hover:text-error">Tutup</button>
                   </div>
                   <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {searchResults.map((track) => (
                         <button 
                           key={track.videoId}
                           onClick={() => playMusic(track)}
                           className={`flex items-center gap-4 p-3 rounded-[1.5rem] transition-all border w-full group ${musicData.videoId === track.videoId ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-surface-container-low border-transparent hover:border-outline-variant/20 hover:bg-surface-container-high'}`}
                         >
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                               <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                               {track.duration && (
                                 <span className="absolute bottom-1 right-1 bg-black/60 text-[8px] font-bold text-white px-1 rounded leading-tight">{Math.floor(track.duration/60)}:{(track.duration%60).toString().padStart(2,'0')}</span>
                               )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                               <h5 className="font-headline font-black text-xs text-on-surface truncate tracking-tight">{track.title}</h5>
                               <p className="text-[10px] font-bold text-on-surface-variant/70 truncate uppercase tracking-widest mt-0.5">{track.artist}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${musicData.videoId === track.videoId && musicData.isPlaying ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-surface-container-highest/50 text-on-surface-variant group-hover:bg-indigo-500 group-hover:text-white'}`}>
                               <span className="material-symbols-outlined text-lg">
                                  {musicData.videoId === track.videoId && musicData.isPlaying ? 'pause' : 'play_arrow'}
                               </span>
                            </div>
                         </button>
                      ))}
                   </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-5 px-1">
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Playlist Konseling</h4>
                      <p className="text-[8px] text-on-surface-variant/60 font-bold uppercase tracking-widest mt-0.5">{COUNSELING_PLAYLIST.length} lagu pilihan</p>
                   </div>
                   <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div>
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75"></div>
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
                   </div>
                </div>

                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                  {COUNSELING_PLAYLIST.map((song) => {
                    const isLoading = loadingTrackId === song.id;
                    return (
                      <button
                        key={song.id}
                        onClick={() => handlePlayCuratedSong(song)}
                        disabled={isLoading}
                        className="flex items-center gap-3 w-full p-3 rounded-2xl transition-all border group bg-surface-container-low border-transparent hover:border-indigo-500/30 hover:bg-indigo-500/5 disabled:opacity-70 text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-surface-container-highest/60 flex items-center justify-center shrink-0 border border-outline-variant/10 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all">
                          {isLoading ? (
                            <span className="material-symbols-outlined text-sm animate-spin text-indigo-500 group-hover:text-white">progress_activity</span>
                          ) : (
                            <span className="text-[10px] font-black text-on-surface-variant group-hover:text-white transition-colors">{song.id}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-headline font-black text-xs text-on-surface truncate tracking-tight">{song.title}</h5>
                          {song.artist && (
                            <p className="text-[9px] font-bold text-on-surface-variant/70 truncate uppercase tracking-widest mt-0.5">{song.artist}</p>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest/50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-on-surface-variant transition-all shrink-0">
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
           </div>
        </section>

        <section className="bg-primary text-on-primary rounded-[2rem] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
           <h2 className="text-center font-headline font-black text-xl mb-1 mt-2 uppercase tracking-tight relative z-10">Kondisi Mental Pasca Bencana</h2>
           <p className="text-center text-[10px] text-on-primary/70 mb-8 font-bold uppercase tracking-widest relative z-10">Ruang Aman untuk Mencatat Pemulihan Anda</p>
           
           <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8 w-full relative z-10">
             {MOOD_EMOJIS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    selectedMood?.id === mood.id 
                      ? 'bg-white text-primary scale-110 shadow-xl border-white' 
                      : 'border-transparent bg-white/10 hover:bg-white/20 text-white opacity-80 hover:opacity-100'
                  }`}
                >
                   <span className="text-3xl mb-1 drop-shadow-sm">{mood.emoji}</span>
                   <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{mood.label}</span>
                </button>
             ))}
           </div>

           {selectedMood && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                 <textarea
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   placeholder="Ada cerita apa dibalik perasaanmu ini? (Opsional, tapi sangat disarankan ditulis)"
                   className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-white/50 focus:bg-white/20 outline-none resize-none h-28 backdrop-blur-md"
                 />
                 <button
                   onClick={handleSaveMood}
                   disabled={saving}
                   className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase tracking-widest py-4 rounded-2xl flex justify-center items-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                 >
                   <span className="material-symbols-outlined">save</span> {saving ? 'Menyimpan...' : 'Simpan Jurnal'}
                 </button>
              </div>
           )}
        </section>

        <section>
           <div className="flex items-center justify-between mb-6 px-2">
               <h3 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest">Riwayat Entri Jurnal</h3>
               <span className="text-xs font-bold text-on-surface bg-surface-container-high px-3 py-1 rounded-full">{stats.totalLogs} Catatan</span>
           </div>
           
           {moodLogs.length === 0 ? (
              <div className="glass-card rounded-[2rem] p-10 text-center border-dashed">
                 <p className="text-on-surface-variant text-sm font-medium">Belum ada catatan konseling dalam 30 hari terakhir. Mulailah hari ini!</p>
              </div>
           ) : (
             <div className="space-y-4">
               {moodLogs.map(log => {
                 const moodDef = MOOD_EMOJIS.find(m => m.id === log.moodId) || MOOD_EMOJIS[2];
                 const dateObj = log.timestamp ? log.timestamp.toDate() : new Date();
                 const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                 const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                 return (
                   <div key={log.id} className="glass-card p-5 rounded-[1.5rem] flex gap-4 items-start transition-all hover:shadow-lg shadow-sm group relative overflow-hidden border border-outline-variant/20">
                      <div className={`absolute -right-8 -top-8 w-32 h-32 opacity-20 blur-2xl rounded-full ${moodDef.color.split(' ')[0]} pointer-events-none`}></div>
                      <div className={`w-14 h-14 rounded-[1.1rem] flex items-center justify-center shrink-0 border ${moodDef.color} shadow-sm backdrop-blur-sm relative z-10`}>
                        <span className="text-3xl drop-shadow-sm">{log.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0 z-10 pt-0.5">
                         <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-headline font-black text-sm text-on-surface capitalize">{dateStr}</h4>
                            <span className="w-1 h-1 rounded-full bg-outline-variant/40"></span>
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{timeStr}</span>
                            <div className={`ml-auto px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${moodDef.color} shadow-sm border`}>
                               {moodDef.label || log.moodLabel}
                            </div>
                         </div>
                         {log.note ? (
                            <div className="mt-3 relative group-hover:bg-surface-container-lowest/30 p-1 -ml-1 rounded-xl transition-colors">
                               <div className="absolute left-2 top-2 bottom-2 w-1 rounded-full bg-outline-variant/20"></div>
                               <p className="text-[13px] text-on-surface-variant leading-relaxed font-medium pl-6 pr-8 py-1">{log.note}</p>
                            </div>
                         ) : (
                            <p className="text-[10px] text-on-surface-variant/40 mt-3 uppercase tracking-widest font-bold">Tanpa Catatan Tambahan</p>
                         )}
                      </div>
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="absolute right-3 bottom-3 md:top-4 md:bottom-auto text-on-surface-variant/30 hover:text-error hover:bg-error/10 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 z-20"
                        title="Hapus Jurnal"
                      >
                         <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                   </div>
                 );
               })}
             </div>
           )}
        </section>
      </main>
    </div>
  );
};

export default MoodTracker;
