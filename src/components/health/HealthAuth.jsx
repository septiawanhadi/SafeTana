import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowLeft, ShieldCheck, HeartPulse } from 'lucide-react';
import { auth, db } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const HealthAuth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDomainHint, setShowDomainHint] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if already logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/health');
    });
    return () => unsub();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowDomainHint(false);

    try {
      if (isLogin) {
        // LOGIN FLOW
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/health'); 
      } else {
        // REGISTER FLOW
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile in Auth
        await updateProfile(user, { displayName: name });

        // Save user data to Firestore
        await setDoc(doc(db, 'safetana_health_users', user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          createdAt: serverTimestamp(),
          role: 'patient',
          status: 'active'
        });

        navigate('/health'); 
      }
    } catch (err) {
      console.error("Auth Error:", err);
      
      // Check for domain authorization error code or generic failure on custom domain
      if (err.code === 'auth/unauthorized-domain' || window.location.hostname !== 'localhost') {
        setShowDomainHint(true);
      }

      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar. Silakan login.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Email atau password salah.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password minimal 6 karakter.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Masalah jaringan. Periksa koneksi internet atau ad-blocker Anda.');
      } else {
        setError(`Kesalahan: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 font-body selection:bg-primary/30 selection:text-white">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full animate-float"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-white transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/10">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Home</span>
        </button>

        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl mb-6 group transition-transform hover:scale-105">
               <HeartPulse className="text-primary group-hover:animate-pulse" size={40} />
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tight mb-2">SafeTana <span className="text-primary italic">Health</span></h1>
            <p className="text-slate-500 text-sm font-medium">Layanan Rekam Medis & Skrining Mandiri AI</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            
            <div className="flex bg-white/5 rounded-2xl p-1.5 mb-8 border border-white/5">
              <button 
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Login
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Daftar
              </button>
            </div>

            {error && (
              <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-4">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-red-200 font-bold leading-relaxed">{error}</p>
                    {showDomainHint && (
                      <p className="text-[10px] text-red-400/80 font-medium mt-2 leading-relaxed">
                        Tip: Jika ini domain baru, pastikan telah terdaftar di Authorized Domains Firebase Console.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                      placeholder="Contoh: Budi Santoso"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                    placeholder="anda@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs mt-4 group"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                    <span>{isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'}</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <p className="mt-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
            Keamanan Data Anda Terjamin Dengan <span className="text-slate-400">End-to-End Encryption</span> & Firebase Secure Storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthAuth;
