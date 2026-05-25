import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Activity, Info } from 'lucide-react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Integration: Service Pattern
import { dataService } from '../../services/health/dataService';
import { satuSehatService } from '../../services/health/satuSehatService';
import { calculateRisk } from '../../utils/healthUtils';

const HealthScreening = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    usia: '',
    gender: '',
    bb: '',
    tb: '',
    sistolik: '',
    diastolik: '',
    denyutJantung: '',
    polaMakan: 'Sehat',
    begadang: 'Tidak',
    merokok: 'Tidak',
    paparanRokok: 'Tidak Pernah',
    durasiRokok: '',
    riwayatPribadi: { hipertensi: false, diabetes: false, jantung: false, stroke: false, asma: false },
    riwayatKeluarga: { hipertensi: false, diabetes: false, jantung: false },
    gejalaFisik: { batukLama: false, bbTurun: false, sesakNapas: false, seringLelah: false, pusing: false },
    gejalaMental: { sakitKepala: false, hilangNafsuMakan: false, tidakNyenyak: false, cemas: false, tidakBahagia: false }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setFormData(prev => ({ ...prev, nama: currentUser.displayName || '' }));
      } else {
        navigate('/health/auth');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.includes('.')) {
      const [category, item] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [item]: checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // calculateRisk logic moved to src/utils/healthUtils.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const assessment = calculateRisk(formData);

    try {
      const screeningData = {
        inputData: formData,
        assessment: assessment
      };
      
      // Use centralized Service
      await dataService.healthScreenings.add(user.uid, screeningData);
      
      // SINKRONISASI SATUSEHAT
      try {
        await satuSehatService.submitScreening(formData.nik, formData, assessment);
        console.log("Berhasil sinkronisasi ke SATUSEHAT Sandbox");
      } catch (ssErr) {
        console.warn("Sinkronisasi SATUSEHAT gagal, namun data lokal tersimpan.", ssErr);
      }
      
      setResult(assessment);
    } catch (err) {
      console.error("Gagal menyimpan skrining:", err);
      if (err.code === 'permission-denied') {
        alert('Gagal menyimpan: Akses ditolak. Pastikan Anda sudah login dengan benar.');
      } else {
        alert('Gagal menyimpan catatan skrining. Silakan coba lagi nanti.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (result) {
    const getRiskColors = (level) => {
      switch (level) {
        case 'Tinggi': return { bg: 'bg-error/10', text: 'text-error', border: 'border-error/20', aura: 'pulse-red' };
        case 'Sedang': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', aura: 'pulse-amber' };
        default: return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', aura: 'breathing-aura' };
      }
    };

    const colors = getRiskColors(result.riskLevel);
    const bmi = result.imt;
    
    // BMI Category for the meter
    const getBmiCategory = (val) => {
      let percent = ((val - 15) / 25) * 100;
      percent = Math.max(0, Math.min(100, percent));
      const pos = `${percent}%`;

      if (val < 18.5) return { label: 'Kurus', pos, color: 'text-blue-400', bg: 'bg-blue-400' };
      if (val < 25) return { label: 'Normal', pos, color: 'text-success', bg: 'bg-success' };
      if (val < 30) return { label: 'Overweight', pos, color: 'text-amber-500', bg: 'bg-amber-500' };
      return { label: 'Obesitas', pos, color: 'text-error', bg: 'bg-error' };
    };
    const bmiInfo = getBmiCategory(bmi);

    return (
      <div className="min-h-screen bg-background font-body text-on-background pb-20 overflow-x-hidden">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-20 ${colors.bg}`} />
          <div className={`absolute top-1/2 -left-24 w-80 h-80 rounded-full blur-[100px] opacity-10 bg-primary/20`} />
        </div>

        <header className="glass-card sticky top-0 z-50 border-b border-outline-variant/10 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => navigate('/health')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-black text-lg tracking-tight">Laporan Kesehatan</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 pt-10 pb-32 space-y-8 relative z-10">
          
          {/* Main Risk Card */}
          <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-outline-variant/20 shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 blur-3xl opacity-20 ${colors.bg}`} />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center relative ${colors.aura}`}>
                 <div className={`absolute inset-0 rounded-full border-4 border-dashed border-current opacity-20 animate-[spin_10s_linear_infinite] ${colors.text}`} />
                 <div className={`w-24 h-24 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center shadow-inner`}>
                    <span className={`material-symbols-outlined text-5xl ${colors.text}`}>{result.riskLevel === 'Tinggi' ? 'warning' : result.riskLevel === 'Sedang' ? 'error' : 'verified'}</span>
                 </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${colors.text}`}>Risiko Kesehatan Keseluruhan</span>
                <h2 className="text-5xl font-headline font-black tracking-tighter leading-none">{result.riskLevel}</h2>
                <p className="text-on-surface-variant text-sm max-w-xs mx-auto opacity-80 leading-relaxed">
                  Berdasarkan algoritma analisis medis SafeTana, kondisi kesehatan Anda saat ini berada pada tingkat risiko {result.riskLevel.toLowerCase()}.
                </p>
              </div>
            </div>

            {/* BMI Meter */}
            <div className="mt-12 bg-surface-container-lowest/30 rounded-3xl p-6 border border-outline-variant/10">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">BMI (Indeks Massa Tubuh)</h3>
                 <span className={`text-xl font-headline font-black ${bmiInfo.color}`}>{bmi.toFixed(1)}</span>
               </div>
               
               <div className="relative h-5 bg-surface-container-high rounded-full overflow-hidden mb-3 shadow-inner">
                 {/* Color Zones */}
                 <div className="absolute inset-0 flex opacity-90">
                   <div className="h-full w-[14%] bg-blue-500 border-r-2 border-background/50" />
                   <div className="h-full w-[26%] bg-emerald-500 border-r-2 border-background/50" />
                   <div className="h-full w-[20%] bg-amber-500 border-r-2 border-background/50" />
                   <div className="h-full flex-1 bg-red-500" />
                 </div>
                 {/* Indicator Pin */}
                 <div 
                   className="absolute -top-1 -bottom-1 w-2.5 bg-white shadow-xl z-10 transition-all duration-1000 ease-out rounded-full border border-background/40" 
                   style={{ left: `calc(${bmiInfo.pos} - 5px)` }} 
                 >
                   <div className="absolute inset-0 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                 </div>
               </div>
               
               <div className="relative flex text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80">
                 <div className="w-[14%] text-center">Kurus</div>
                 <div className="w-[26%] text-center">Ideal</div>
                 <div className="w-[20%] text-center">Lebih</div>
                 <div className="flex-1 text-center">Obesitas</div>
               </div>
               
               <div className="mt-5 flex items-center gap-2 bg-surface-container-high/50 p-3 rounded-2xl">
                 <div className={`w-3 h-3 rounded-full ${bmiInfo.bg} shadow-lg`} />
                 <p className="text-xs font-bold text-on-surface-variant">Status Anda: <span className={`${bmiInfo.color} font-black text-sm uppercase tracking-wider ml-1`}>{bmiInfo.label}</span></p>
               </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-3xl p-6 border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">vital_signs</span>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tekanan Darah</h4>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-headline font-black">{formData.sistolik || '--'}/{formData.diastolik || '--'}</span>
                <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase">mmHg</span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-outline-variant/10 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Detak Jantung</h4>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-headline font-black">{formData.denyutJantung || '--'}</span>
                <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase">BPM</span>
              </div>
            </div>
          </div>

          {/* Findings & Recommendations */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-primary">analytics</span>
               <h3 className="font-headline font-black text-sm uppercase tracking-widest">Analisis Detail</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {result.findings.map((item, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl border-l-4 border-l-primary/50 shadow-sm flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">info</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-on-surface text-sm">{item.title}</h5>
                    <p className="text-xs text-on-surface-variant opacity-80 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm">
               <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                 <span className="material-symbols-outlined text-base">task_alt</span>
                 Langkah Perbaikan (Saran)
               </h4>
               <ul className="space-y-4">
                 {result.recommendations.map((rec, idx) => (
                   <li key={idx} className="flex gap-4 items-start group">
                     <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                       <span className="material-symbols-outlined text-sm">check</span>
                     </div>
                     <p className="text-sm font-medium text-on-surface-variant leading-relaxed">{rec}</p>
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
             <button 
               onClick={() => navigate('/health')}
               className="w-full bg-primary hover:bg-primary/90 text-on-primary font-black py-5 rounded-3xl transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group"
             >
               Simpan & Selesai
               <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
             </button>
             
             <button 
               onClick={() => setResult(null)}
               className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold py-4 rounded-3xl transition-all active:scale-95 uppercase tracking-widest text-[10px]"
             >
               Skrining Ulang
             </button>
          </div>

          <div className="flex justify-center pt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-on-surface/5 rounded-full">
              <span className="material-symbols-outlined text-xs text-on-surface-variant">verified_user</span>
              <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">Medical analysis verified by SafeTana AI Engine</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body pb-20">
      <header className="glass-card shadow-sm sticky top-0 z-50 border-b border-outline-variant/20 relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-[-1]" />
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <button onClick={() => navigate('/health')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2">
               <span className="material-symbols-outlined text-success">vital_signs</span>
               <h1 className="font-headline font-black text-lg text-on-surface tracking-tight">Skrining Cerdas</h1>
             </div>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-32 space-y-6">
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-primary shadow-sm flex items-start gap-4">
           <span className="material-symbols-outlined text-primary text-2xl shrink-0">info</span>
           <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
             Sistem Penilaian Cerdas (Rule-Based AI) ini akan mengevaluasi kondisi Anda secara instan berdasarkan parameter medis terenkripsi.
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm">
            <h2 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest mb-6">Pengukuran Fisik & Identitas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">NIK (Nomor Induk Kependudukan)</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleChange} required minLength="16" maxLength="16" className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface transition-all placeholder:text-on-surface-variant/40" placeholder="Masukkan 16 Digit NIK Anda" />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Usia (Tahun)</label>
                <input type="number" name="usia" value={formData.usia} onChange={handleChange} required className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface transition-all placeholder:text-on-surface-variant/40" placeholder="Ketik disini..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Berat (KG)</label>
                  <input type="number" name="bb" value={formData.bb} onChange={handleChange} required min="20" className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface text-center transition-all placeholder:text-on-surface-variant/40" placeholder="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Tinggi (CM)</label>
                   <input type="number" name="tb" value={formData.tb} onChange={handleChange} required min="50" className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface text-center transition-all placeholder:text-on-surface-variant/40" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Tensi Sistolik</label>
                <input type="number" name="sistolik" value={formData.sistolik} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface transition-all placeholder:text-on-surface-variant/40" placeholder="Atas (Cth: 120)" />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Tensi Diastolik</label>
                <input type="number" name="diastolik" value={formData.diastolik} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface transition-all placeholder:text-on-surface-variant/40" placeholder="Bawah (Cth: 80)" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Detak Jantung (BPM)</label>
                <div className="relative">
                  <input type="number" name="denyutJantung" value={formData.denyutJantung} onChange={handleChange} className="w-full p-4 pr-16 rounded-xl border border-outline-variant/20 bg-surface-container-highest focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm font-bold text-on-surface transition-all placeholder:text-on-surface-variant/40" placeholder="Detak per menit" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">BPM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm">
            <h2 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest mb-6">Kebiasaan Sehari-hari</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                 <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Merokok Aktif?</label>
                 <select name="merokok" value={formData.merokok} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest text-sm font-bold cursor-pointer text-on-surface outline-none focus:ring-2 focus:ring-primary">
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Paparan Asap Rokok</label>
                 <select name="paparanRokok" value={formData.paparanRokok} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest text-sm font-bold cursor-pointer text-on-surface outline-none focus:ring-2 focus:ring-primary">
                    <option value="Tidak Pernah">Jarang / Tidak Pernah</option>
                    <option value="Sering">Sering</option>
                    <option value="Setiap Hari">Tiap Hari</option>
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Durasi Merokok (Tahun)</label>
                 <input type="number" name="durasiRokok" value={formData.durasiRokok} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40" placeholder="0" />
              </div>
              <div>
                 <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Pola Makan</label>
                 <select name="polaMakan" value={formData.polaMakan} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest text-sm font-bold cursor-pointer text-on-surface outline-none focus:ring-2 focus:ring-primary">
                    <option value="Sehat">Sehat</option>
                    <option value="Kurang Sehat">Kurang Sehat</option>
                    <option value="Tidak Sehat">Tidak Sehat</option>
                 </select>
              </div>
              <div className="sm:col-span-2">
                 <label className="block text-[10px] font-bold mb-2 uppercase text-on-surface-variant tracking-wider">Sering Begadang?</label>
                 <select name="begadang" value={formData.begadang} onChange={handleChange} className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-highest text-sm font-bold cursor-pointer text-on-surface outline-none focus:ring-2 focus:ring-primary">
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                 </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm">
              <h2 className="font-headline font-black text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">Riwayat Medis Pribadi</h2>
              <div className="space-y-3">
                {Object.keys(formData.riwayatPribadi).map(item => (
                  <label key={item} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition group cursor-pointer border border-transparent hover:border-outline-variant/10">
                    <input type="checkbox" name={`riwayatPribadi.${item}`} checked={formData.riwayatPribadi[item]} onChange={handleChange} className="w-5 h-5 text-primary rounded border-outline-variant/30 focus:ring-primary bg-surface-container-highest" />
                    <span className="text-sm font-bold capitalize text-on-surface group-hover:text-primary transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm">
              <h2 className="font-headline font-black text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">Riwayat Bawaan Keluarga</h2>
              <div className="space-y-3">
                {Object.keys(formData.riwayatKeluarga).map(item => (
                  <label key={item} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition group cursor-pointer border border-transparent hover:border-outline-variant/10">
                    <input type="checkbox" name={`riwayatKeluarga.${item}`} checked={formData.riwayatKeluarga[item]} onChange={handleChange} className="w-5 h-5 text-primary rounded border-outline-variant/30 focus:ring-primary bg-surface-container-highest" />
                    <span className="text-sm font-bold capitalize text-on-surface group-hover:text-primary transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

           <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm">
            <h2 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest mb-6">Keluhan 2 Minggu Terakhir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div className="col-span-1 md:col-span-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 border-b border-outline-variant/20 pb-2">Gejala Fisik</div>
              {Object.keys(formData.gejalaFisik).map(item => (
                <label key={item} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-lowest/50 hover:bg-surface-container-high border border-outline-variant/10 transition group cursor-pointer">
                  <input type="checkbox" name={`gejalaFisik.${item}`} checked={formData.gejalaFisik[item]} onChange={handleChange} className="w-5 h-5 text-primary rounded border-outline-variant/30 focus:ring-primary bg-surface-container-highest" />
                  <span className="text-sm font-bold capitalize text-on-surface group-hover:text-primary transition-colors">{item.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
              <div className="col-span-1 md:col-span-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 mt-4 border-b border-outline-variant/20 pb-2">Gejala Mental</div>
              {Object.keys(formData.gejalaMental).map(item => (
                <label key={item} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-lowest/50 hover:bg-surface-container-high border border-outline-variant/10 transition group cursor-pointer">
                  <input type="checkbox" name={`gejalaMental.${item}`} checked={formData.gejalaMental[item]} onChange={handleChange} className="w-5 h-5 text-primary rounded border-outline-variant/30 focus:ring-primary bg-surface-container-highest" />
                  <span className="text-sm font-bold capitalize text-on-surface group-hover:text-primary transition-colors">{item.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-on-primary font-black uppercase tracking-widest py-4 md:py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3">
            {submitting ? (
              <><span className="material-symbols-outlined animate-spin">autorenew</span> Menganalisa Data...</>
            ) : (
              <><span className="material-symbols-outlined">analytics</span> Analisis Kesehatan Saya</>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default HealthScreening;
