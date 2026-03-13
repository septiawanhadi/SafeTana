import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Save, Trash2, TrendingUp, Flame, Activity } from 'lucide-react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const MOOD_EMOJIS = [
  { id: 'happy', emoji: '😄', label: 'Senang', color: 'bg-green-100 text-green-600 border-green-300', score: 5 },
  { id: 'calm', emoji: '😌', label: 'Tenang', color: 'bg-blue-100 text-blue-600 border-blue-300', score: 4 },
  { id: 'neutral', emoji: '😐', label: 'Netral', color: 'bg-slate-100 text-slate-600 border-slate-300', score: 3 },
  { id: 'sad', emoji: '😢', label: 'Sedih', color: 'bg-indigo-100 text-indigo-600 border-indigo-300', score: 2 },
  { id: 'angry', emoji: '😠', label: 'Marah', color: 'bg-red-100 text-red-600 border-red-300', score: 1 },
  { id: 'anxious', emoji: '😰', label: 'Cemas', color: 'bg-purple-100 text-purple-600 border-purple-300', score: 1 }
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
    
    // Filter out logs older than 30 days and valid dates
    const recentLogs = logs.filter(log => {
      const logDate = log.timestamp ? log.timestamp.toDate() : new Date();
      return logDate >= thirtyDaysAgo;
    });

    // Most Frequent
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

    // Current Streak (Consecutive days ignoring missing days, or simple count of unique days)
    // Here we do a simple unique active days in the last 30 days
    const uniqueDays = new Set(recentLogs.map(log => {
      const d = log.timestamp ? log.timestamp.toDate() : new Date();
      return d.toDateString();
    })).size;

    const avgScore = recentLogs.length > 0 ? (totalScore / recentLogs.length) : 0;

    return {
      totalLogs: recentLogs.length,
      streak: uniqueDays, // Menggunakan active days sbg proxy streak sederhana
      mostFrequent: topMoodDef,
      averageScore: avgScore
    };
  };

  const fetchMoodLogs = async (userId) => {
    try {
      const q = query(
        collection(db, 'mood_logs'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort logs by timestamp descending in JS to prevent Firebase composite index requirements
      logs.sort((a, b) => {
        const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });

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
      await addDoc(collection(db, 'mood_logs'), {
        userId: user.uid,
        moodId: selectedMood.id,
        moodLabel: selectedMood.label,
        emoji: selectedMood.emoji,
        note: note.trim(),
        timestamp: serverTimestamp()
      });
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
        await deleteDoc(doc(db, 'mood_logs', logId));
        const updatedLogs = moodLogs.filter(log => log.id !== logId);
        setMoodLogs(updatedLogs);
        setStats(calculateStats(updatedLogs));
      } catch (err) {
        console.error("Gagal menghapus mood:", err);
      }
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate('/health')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
               <Calendar className="text-purple-500" size={18} />
               <h1 className="font-bold text-lg">Catatan Mood 30 Hari</h1>
             </div>
          </div>
          <div className="w-9"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        
        {/* STATISTIK 30 HARI */}
        <section className="grid grid-cols-3 gap-3">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <Flame className="text-orange-500 mb-1" size={24} />
              <p className="text-2xl font-black">{stats.streak}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hari Aktif</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-2xl mb-1">{stats.mostFrequent ? stats.mostFrequent.emoji : '➖'}</span>
              <p className="text-sm font-bold truncate w-full">{stats.mostFrequent ? stats.mostFrequent.label : '-'}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sering Muncul</p>
           </div>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center">
              <Activity className={`${stats.averageScore >= 3 ? 'text-green-500' : 'text-red-500'} mb-1`} size={24} />
              <p className="text-2xl font-black">{stats.averageScore.toFixed(1)}/5</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Skor Rata-rata</p>
           </div>
        </section>

        {/* INPUT SECTION */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg border border-purple-500/50">
           <h2 className="text-center font-black text-xl mb-1 text-white">Bagaimana perasaanmu hari ini?</h2>
           <p className="text-center text-xs text-purple-200 mb-6 font-medium">Bantu kami mencatat kondisi emosionalmu hari ini.</p>
           
           <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
             {MOOD_EMOJIS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    selectedMood?.id === mood.id 
                      ? 'bg-white text-slate-900 scale-110 shadow-xl border-white' 
                      : 'border-transparent bg-white/10 hover:bg-white/20 text-white opacity-80 hover:opacity-100'
                  }`}
                >
                   <span className="text-3xl mb-1">{mood.emoji}</span>
                   <span className={`text-[9px] font-bold uppercase tracking-wider ${selectedMood?.id === mood.id ? mood.color.split(' ')[1] : ''}`}>{mood.label}</span>
                </button>
             ))}
           </div>

           {selectedMood && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <textarea
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   placeholder="Ada cerita apa dibalik perasaanmu ini? (Opsional, tapi sangat disarankan ditulis)"
                   className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-purple-200 focus:ring-2 focus:ring-white outline-none resize-none h-24"
                 />
                 <button
                   onClick={handleSaveMood}
                   disabled={saving}
                   className="w-full bg-white text-purple-700 hover:bg-purple-50 font-black uppercase tracking-widest py-3.5 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                 >
                   <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan Jurnal'}
                 </button>
              </div>
           )}
        </section>

        {/* RECENT LOGS SECTION */}
        <section>
           <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Riwayat Entri Jurnal</h3>
               <span className="text-xs font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md">{stats.totalLogs} Catatan</span>
           </div>
           
           {moodLogs.length === 0 ? (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8 text-center border border-slate-200 border-dashed dark:border-slate-700">
                 <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada catatan mood dalam 30 hari terakhir. Mulailah hari ini!</p>
              </div>
           ) : (
             <div className="space-y-3">
               {moodLogs.map(log => {
                 const moodDef = MOOD_EMOJIS.find(m => m.id === log.moodId) || MOOD_EMOJIS[2];
                 const dateObj = log.timestamp ? log.timestamp.toDate() : new Date();
                 const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
                 const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                 return (
                   <div key={log.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-4 items-start shadow-sm hover:shadow transition-shadow group">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col justify-center items-center shrink-0 border ${moodDef.color}`}>
                        <span className="text-2xl mb-0.5">{log.emoji}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest">{log.moodLabel}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">{dateStr}</h4>
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md text-slate-500 dark:text-slate-300 font-medium shrink-0">{timeStr} WIB</span>
                         </div>
                         {log.note ? (
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 italic">
                               "{log.note}"
                            </p>
                         ) : (
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Tanpa Catatan Ekstra</p>
                         )}
                      </div>
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 rounded-xl transition sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
                        title="Hapus Jurnal"
                      >
                         <Trash2 size={16} />
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
