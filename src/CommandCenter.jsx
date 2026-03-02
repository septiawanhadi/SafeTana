import React, { useState, useEffect } from 'react';
import {
  Users, MapPin, Battery, AlertCircle, CheckCircle,
  Clock, X, Search, ShieldAlert, Send, Radio, Smartphone, MessageSquare
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions, db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const CommandCenter = ({ onClose, onSendBroadcast }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setBroadcastError('');

    try {
      /* 
        ========================================================================
        BAGIAN INI DIMATIKAN SEMENTARA AGAR TIDAK MUNCUL ERROR CORS DI CONSOLE 
        KARENA CLOUD FUNCTION BERLUM BISA DI-DEPLOY (BUTUH FIREBASE BLAZE PLAN).
        
        Kode Asli untuk Production Seharusnya Seperti Ini:
        ------------------------------------------------------------------------
        const sendBroadcastFn = httpsCallable(functions, 'sendBroadcastNotification');
        const payload = { title: "Peringatan", body: broadcastMessage, topic: "all_users" };
        const result = await sendBroadcastFn(payload);
        ========================================================================
      */

      // Simulasi delay jaringan
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Jika simulasi berhasil:
      if (onSendBroadcast) onSendBroadcast(broadcastMessage);
      setBroadcastSuccess(true);
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccess(false), 4000);

    } catch (error) {
      console.error("Kesalahan saat Broadcast FCM:", error);
      setBroadcastError(error.message || "Gagal menghubungi server");
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
        <button onClick={onClose} className="bg-slate-800 p-3 rounded-2xl hover:bg-red-600 transition-all text-white"><X size={20} /></button>
      </header>

      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* BROADCAST PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-800/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Radio size={80} className="text-blue-500" /></div>
              <h4 className="font-black uppercase tracking-tighter text-lg mb-4 flex items-center gap-3"><Send size={20} className="text-blue-400" /> Omni-Broadcast</h4>
              <p className="text-[10px] text-slate-400 font-bold mb-6 leading-relaxed uppercase tracking-widest">Kirim Peringatan (SMS/WA/APP)</p>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Instruksi Evakuasi..." className="w-full h-32 bg-slate-950 border border-slate-700 rounded-3xl p-5 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />

                {broadcastError && <p className="text-red-500 text-[10px] uppercase font-bold text-center">{broadcastError}</p>}

                <button type="submit" disabled={isBroadcasting} className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 ${broadcastSuccess ? 'bg-green-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}>
                  {isBroadcasting ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                  {broadcastSuccess ? 'Berhasil Terkirim' : 'Eksekusi Broadcast'}
                </button>
              </form>
            </div>
          </div>

          {/* TABLE PANEL */}
          <div className="lg:col-span-8 bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden flex flex-col text-white">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Live User Analytics</h3>
              <input type="text" placeholder="Cari User..." className="bg-slate-950 border border-slate-700 rounded-2xl py-2 px-4 text-xs text-white outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {users?.filter(u => u?.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;