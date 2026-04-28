import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, X, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const AdminLogin = ({ onLogin, onClose }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      if (onLogin) {
        onLogin();
      } else {
        navigate('/commands');
      }
    } catch (err) {
      console.error(err);
      setError('Kredensial tidak valid. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-[#020617] flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-red-600/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        
        {/* Header Ribbon */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400">Restricted Access</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          
          {/* Subtle glow on card hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <button onClick={handleClose} className="absolute top-6 right-6 text-slate-500 hover:text-white hover:rotate-90 transition-all duration-300 bg-white/5 p-2 rounded-full">
            <X size={18} />
          </button>

          <div className="flex flex-col items-center mb-10 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 blur-xl rounded-full pointer-events-none"></div>
            <div className="bg-slate-950 p-3 rounded-2xl mb-5 shadow-2xl h-20 w-20 flex items-center justify-center overflow-hidden border border-slate-800 relative z-10 group-hover:scale-105 transition-transform duration-500">
              <img src="/logo.png" alt="SafeTana AI Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white drop-shadow-lg">Command Center</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 text-center border-t border-slate-800 pt-2 w-full">Tactical Authentication</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Admin Identity</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-blue-400 text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="email"
                  placeholder="admin@safetana.gov"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Passcode</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-blue-400 text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-700 tracking-widest"
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3 text-red-400 text-xs font-bold p-4 bg-red-950/30 rounded-2xl border border-red-900/50">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
                  <span className="leading-relaxed">{error}</span>
                </div>
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full relative group/btn overflow-hidden rounded-2xl mt-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-transform duration-500 group-hover/btn:scale-[1.05]"></div>
              <div className="relative flex justify-center items-center gap-3 py-4 font-black text-[11px] uppercase tracking-[0.2em] text-white disabled:opacity-70 transition-all shadow-2xl shadow-blue-900/20">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? 'Decrypting...' : 'Initiate Override'}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;