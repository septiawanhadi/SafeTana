import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, MapPin, Battery, AlertCircle, CheckCircle,
  Clock, X, Search, ShieldAlert, Send, Radio, Smartphone, MessageSquare, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions, db } from './firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import SafeZoneManager from './SafeZoneManager';

const CommandCenter = ({ reports = [], onClose, onSendBroadcast }) => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'safezones'
  const [searchTerm, setSearchTerm] = useState('');
  const [is24HourFilter, setIs24HourFilter] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');
  const [analyticsError, setAnalyticsError] = useState('');

  useEffect(() => {
    setAnalyticsError('');
    const q = query(collection(db, 'active_users'), orderBy('lastActive', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(activeUsers);
    }, (error) => {
      console.error("User Analytics Error:", error);
      setAnalyticsError(error.message);
    });

    return () => unsubscribe();
  }, []);

  const stats = {
    total: users?.length || 0,
    critical: users?.filter(u => u.status === 'Butuh Evakuasi').length || 0,
    safe: users?.filter(u => u.status === 'Aman').length || 0
  };

  const toggle24HourFilter = () => {
    const newState = !is24HourFilter;
    setIs24HourFilter(newState);
    if (newState) {
      setLastRefreshedTime(new Date());
    } else {
      setLastRefreshedTime(null);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!is24HourFilter) return true;
    if (!user.lastActive) return false;
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const userTime = user.lastActive.toMillis 
      ? user.lastActive.toMillis() 
      : (user.lastActive.seconds ? user.lastActive.seconds * 1000 : new Date(user.lastActive).getTime());
    return userTime >= twentyFourHoursAgo;
  });

  const handleBroadcast = async (disaster) => {
    setIsBroadcasting(true);
    setBroadcastError('');

    try {
      await addDoc(collection(db, 'broadcasts'), {
        type: disaster.type,
        loc: disaster.loc,
        position: disaster.position,
        desc: disaster.desc,
        source: disaster.source,
        timestamp: serverTimestamp()
      });

      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 4000);

    } catch (error) {
      console.error("Kesalahan saat Broadcast ke Firestore:", error);
      setBroadcastError(error.message || "Gagal menyimpan broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] text-slate-200 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] bg-blue-700/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] bg-indigo-700/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Floating Header */}
      <header className="relative z-10 mx-6 mt-6 p-5 bg-slate-950/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-red-600 to-red-900 p-3 rounded-2xl border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.3)] relative overflow-hidden group cursor-default">
            <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <ShieldAlert className="text-white relative z-10" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Command Center</h2>
              <div className="px-2 py-0.5 rounded border border-green-500/30 bg-green-500/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">System Online</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
              <span className="text-blue-500">SafeTana</span> Tactical Monitoring
            </p>
          </div>
        </div>
        <button onClick={handleClose} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl hover:bg-red-950 hover:border-red-500/50 hover:text-red-400 transition-all text-slate-400 group relative overflow-hidden">
           <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
           <X size={20} className="relative z-10" />
        </button>
      </header>

      <div className="relative z-10 flex-1 p-6 overflow-y-auto space-y-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Omni Broadcast Panel */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <div className="bg-gradient-to-b from-blue-900/30 to-slate-900/80 border border-blue-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white flex-1 flex flex-col backdrop-blur-xl">
              <div className="absolute -top-10 -right-10 opacity-5"><Radio size={160} className="text-blue-500" /></div>
              
              <div className="relative z-10 mb-6">
                <h4 className="font-black uppercase tracking-tighter text-xl flex items-center gap-3 drop-shadow-md">
                  <span className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30"><Send size={18} className="text-blue-400" /></span>
                  Omni-Broadcast
                </h4>
                <p className="text-[10px] text-blue-200/50 font-bold mt-2 leading-relaxed uppercase tracking-widest">Global Alert Broadcasting System</p>
              </div>

              {broadcastError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] uppercase font-bold text-center p-3 rounded-xl mb-6">{broadcastError}</div>}
              {broadcastSuccess && <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] uppercase font-bold text-center p-3 rounded-xl mb-6">Peringatan Berhasil Terkirim</div>}

              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2 relative z-10">
                {(reports.filter(r => r.source !== 'Dummy System')).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                    <CheckCircle size={32} className="mb-3 opacity-50" />
                    <p className="text-xs font-bold uppercase tracking-widest text-center">Status Hijau<br/><span className="text-[9px]">Tidak ada anomali terdeteksi</span></p>
                  </div>
                ) : (
                  (reports.filter(r => r.source !== 'Dummy System')).map((r, i) => (
                    <div key={i} className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-red-500/20 rounded-lg"><AlertTriangle size={12} className="text-red-500" /></div>
                          <h5 className="text-xs font-black text-white uppercase tracking-tighter">{r.type}</h5>
                        </div>
                        <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">{r.source}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">{r.loc}</p>

                      <button
                        onClick={() => handleBroadcast(r)}
                        disabled={isBroadcasting}
                        className="w-full py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all bg-white text-slate-950 hover:bg-blue-50 hover:text-blue-900 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg group-hover:scale-[1.02]"
                      >
                        {isBroadcasting ? <Loader2 size={14} className="animate-spin text-slate-500" /> : <Send size={14} />}
                        {isBroadcasting ? 'Memproses...' : 'Eksekusi Broadcast'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[3rem] overflow-hidden flex flex-col text-white shadow-2xl relative h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
            
            {/* Segmented Control Tabs */}
            <div className="p-4 border-b border-slate-800/50 bg-slate-950/30">
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 relative z-10">
                <button 
                  onClick={() => setActiveTab('users')} 
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'users' ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  <Users size={14} /> User Analytics
                </button>
                <button 
                  onClick={() => setActiveTab('safezones')} 
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl flex items-center justify-center gap-2 ${activeTab === 'safezones' ? 'bg-green-600/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  <MapPin size={14} /> Manajemen Titik Aman
                </button>
              </div>
            </div>

            {activeTab === 'users' ? (
              <div className="flex flex-col h-full relative z-10">
                <div className="p-6 md:px-8 md:py-6 border-b border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20">
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                      Live Telemetry
                    </h3>
                    {lastRefreshedTime && is24HourFilter && (
                      <span className="text-[9px] text-green-400 font-bold mt-1.5 tracking-widest uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 inline-block w-max">
                        <Clock size={10} className="inline mr-1 -mt-0.5" />
                        Updated: {lastRefreshedTime.toLocaleTimeString('id-ID')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col w-full sm:w-auto sm:flex-row items-stretch sm:items-center gap-3">
                    <button 
                      onClick={toggle24HourFilter}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${is24HourFilter ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'}`}
                    >
                      <RefreshCw size={12} className={is24HourFilter ? 'animate-[spin_0.5s_linear_1]' : ''} />
                      {is24HourFilter ? 'Filter 24H Aktif' : 'Tampilkan 24 Jam'}
                    </button>
                    <div className="relative group/search">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-blue-400 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Identifikasi User..." 
                        className="bg-slate-950 w-full sm:w-56 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600" 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                {analyticsError && (
                  <div className="p-4 mx-6 mt-4 bg-red-950/40 border border-red-900/50 rounded-2xl shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <p className="text-red-400 text-xs font-black flex items-center gap-2 uppercase tracking-widest">
                      <ShieldAlert size={16} /> Akses Ditolak
                    </p>
                    <p className="text-[10px] text-red-300/70 mt-1.5 font-medium leading-relaxed max-w-lg">
                      {analyticsError} <br/>Pastikan Anda memiliki otorisasi level Administrator (Custom Claims) untuk membaca data Active Users.
                    </p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  <table className="w-full text-left border-separate border-spacing-y-2 px-4">
                    <tbody className="text-xs">
                      {filteredUsers?.filter(u => (u?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                        <tr key={user.id} className="bg-slate-950/40 hover:bg-slate-800/60 transition-all group rounded-2xl shadow-sm hover:shadow-md">
                          <td className="p-4 rounded-l-2xl border-y border-l border-slate-800 group-hover:border-slate-700">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-xs">
                                {(user.name || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-black text-slate-200 group-hover:text-white transition-colors">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-4 border-y border-slate-800 group-hover:border-slate-700">
                            <span className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max ${user.status === 'Butuh Evakuasi' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Butuh Evakuasi' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4 text-right rounded-r-2xl border-y border-r border-slate-800 group-hover:border-slate-700">
                            {user.pos && (
                              <a href={`https://maps.google.com/?q=${user.pos[0]},${user.pos[1]}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase inline-flex items-center gap-1.5 transition-all shadow-[0_4px_10px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_15px_rgba(37,99,235,0.5)] hover:-translate-y-0.5">
                                <MapPin size={10} /> Lacak
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers?.length === 0 && !analyticsError && (
                        <tr>
                          <td colSpan="3" className="text-center py-20 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            Tidak ada data pengguna aktif.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full">
                <SafeZoneManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;