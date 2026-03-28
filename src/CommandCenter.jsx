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

  useEffect(() => {
    const q = query(collection(db, 'active_users'), orderBy('lastActive', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(activeUsers);
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
    <div className="fixed inset-0 z-[3000] bg-[#020617] text-slate-200 flex flex-col animate-in fade-in duration-300">
      <header className="border-b border-slate-800 p-6 bg-[#020617]/50 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-4 text-white">
          <div className="bg-red-600/20 p-2 rounded-xl border border-red-500/30"><ShieldAlert className="text-red-500" size={24} /></div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase leading-none">Command Center <span className="text-red-500">SafeTana</span></h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Tactical Monitoring & Disaster Response</p>
          </div>
        </div>
        <button onClick={handleClose} className="bg-slate-800 p-3 rounded-2xl hover:bg-red-600 transition-all text-white"><X size={20} /></button>
      </header>

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-800/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white h-full flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Radio size={80} className="text-blue-500" /></div>
              <h4 className="font-black uppercase tracking-tighter text-lg mb-4 flex items-center gap-3"><Send size={20} className="text-blue-400" /> Omni-Broadcast</h4>
              <p className="text-[10px] text-slate-400 font-bold mb-6 leading-relaxed uppercase tracking-widest">Kirim Peringatan Berbasis Lokasi Bencana</p>

              {broadcastError && <p className="text-red-500 text-[10px] uppercase font-bold text-center mb-4">{broadcastError}</p>}
              {broadcastSuccess && <p className="text-green-500 text-[10px] uppercase font-bold text-center mb-4 bg-green-500/20 p-2 rounded-xl">Berhasil Terkirim ke Firestore</p>}

              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {(reports.filter(r => r.source !== 'Dummy System')).length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-10">Tidak ada data bencana aktif saat ini.</p>
                ) : (
                  (reports.filter(r => r.source !== 'Dummy System')).map((r, i) => (
                    <div key={i} className="bg-slate-950/50 p-4 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-500" />
                          <h5 className="text-xs font-black text-white uppercase tracking-tighter">{r.type}</h5>
                        </div>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-full">{r.source}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold italic mb-3 line-clamp-2">{r.loc}</p>

                      <button
                        onClick={() => handleBroadcast(r)}
                        disabled={isBroadcasting}
                        className="w-full py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all bg-white text-slate-900 hover:bg-slate-200 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isBroadcasting ? <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Send size={12} />}
                        Eksekusi Broadcast
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col text-white">
            <div className="flex border-b border-slate-800">
              <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'users' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}>
                User Analytics
              </button>
              <button onClick={() => setActiveTab('safezones')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'safezones' ? 'bg-green-600/20 text-green-400 border-b-2 border-green-500' : 'text-slate-500 hover:text-slate-300'}`}>
                Manajemen Titik Aman
              </button>
            </div>

            {activeTab === 'users' ? (
              <>
                <div className="p-6 md:p-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live User Analytics</h3>
                    {lastRefreshedTime && is24HourFilter && (
                      <span className="text-[9px] text-green-500 font-bold mt-1 tracking-widest uppercase">24 Jam Terakhir • {lastRefreshedTime.toLocaleTimeString('id-ID')}</span>
                    )}
                  </div>
                  <div className="flex flex-col w-full sm:w-auto sm:flex-row items-stretch sm:items-center gap-3">
                    <button 
                      onClick={toggle24HourFilter}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${is24HourFilter ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >
                      <RefreshCw size={14} className={is24HourFilter ? 'animate-[spin_0.5s_linear_1]' : ''} />
                      {is24HourFilter ? 'Filter Aktif' : 'Refresh 24 Jam'}
                    </button>
                    <input type="text" placeholder="Cari User..." className="bg-slate-950 w-full sm:w-48 border border-slate-700 rounded-2xl py-2 px-4 text-xs text-white outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="overflow-x-auto flex-1 h-[500px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {filteredUsers?.filter(u => u?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-all">
                          <td className="p-6 font-bold">{user.name}</td>
                          <td className="p-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${user.status === 'Butuh Evakuasi' ? 'bg-red-600 text-white' : 'bg-green-600/20 text-green-500 border border-green-500/30'}`}>{user.status}</span></td>
                          <td className="p-6 text-right">
                            {user.pos && (
                              <a href={`https://maps.google.com/?q=${user.pos[0]},${user.pos[1]}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase inline-block">Lacak</a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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