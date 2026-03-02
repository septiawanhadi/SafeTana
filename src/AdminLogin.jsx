import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, X, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const AdminLogin = ({ onLogin, onClose }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      onLogin();
    } catch (err) {
      console.error(err);
      setError('Kredensial tidak valid. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-[#020617]/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-600 p-4 rounded-2xl mb-4 shadow-lg shadow-red-600/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Admin Verification</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              placeholder="Email Administrator"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Verifying...' : 'Verify Identity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;