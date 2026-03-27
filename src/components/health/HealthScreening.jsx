import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Activity, Info } from 'lucide-react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Integration: Service Pattern
import { dataService } from '../../services/health/dataService';

const HealthScreening = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
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
    const { name, value, type, checked } = e.target;
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

  // Rule-based diagnostic logic 
  const calculateRisk = () => {
    const findings = [];
    const recommendations = [];
    let riskLevel = 'Rendah';

    const bb = parseFloat(formData.bb);
    const tb = parseFloat(formData.tb) / 100;
    let imt = 0;
    if (bb > 0 && tb > 0) {
      imt = bb / (tb * tb);
      if (imt >= 25 && imt < 29.9) {
        findings.push({ title: 'Berat Badan Berlebih (Overweight)', desc: `IMT Anda ${imt.toFixed(1)}.` });
        recommendations.push('Atur pola makan dengan defisit kalori and olahraga rutin 150 menit per minggu.');
        if (riskLevel === 'Rendah') riskLevel = 'Sedang';
      } else if (imt >= 30) {
        findings.push({ title: 'Obesitas', desc: `IMT Anda ${imt.toFixed(1)}, risiko tinggi berbagai penyakit.` });
        recommendations.push('Segera konsultasikan program penurunan berat badan dengan ahli gizi. Batasi konsumsi gula dan lemak jenuh.');
        riskLevel = 'Tinggi';
      }
    }

    const sis = parseInt(formData.sistolik);
    const dia = parseInt(formData.diastolik);
    const hr = parseInt(formData.denyutJantung);

    if (sis >= 140 || dia >= 90) {
      findings.push({ title: 'Indikasi Hipertensi', desc: `Tensi Anda ${sis}/${dia} mmHg. Tergolong tinggi.` });
      recommendations.push('Kurangi asupan garam (maksimal 1 sendok teh per hari). Jika berkelanjutan, konsultasikan ke dokter.');
      riskLevel = 'Tinggi';
    } else if ((sis >= 120 && sis < 140) || (dia >= 80 && dia < 90)) {
      findings.push({ title: 'Pra-Hipertensi', desc: `Tensi Anda ${sis}/${dia} mmHg. Mulai meningkat.` });
      recommendations.push('Perbanyak konsumsi sayur, buah, dan hindari stres untuk mencegah hipertensi.');
      if (riskLevel === 'Rendah') riskLevel = 'Sedang';
    }

    if (hr > 100) {
      findings.push({ title: 'Takikardia (Detak Jantung Cepat)', desc: `Denyut jantung Anda ${hr} BPM. Terlalu tinggi saat istirahat.` });
      recommendations.push('Hindari kafein dan rokok. Jika disertai sesak atau nyeri dada, segera ke IGD.');
      riskLevel = 'Tinggi';
    } else if (hr > 0 && hr < 60) {
      findings.push({ title: 'Bradikardia (Detak Jantung Lambat)', desc: `Denyut jantung Anda ${hr} BPM. Di bawah normal (kecuali atlet).` });
      recommendations.push('Jika Anda merasa pusing atau lemas, konsultasikan ke spesialis jantung.');
      if (riskLevel === 'Rendah') riskLevel = 'Sedang';
    }

    if ((sis >= 140 || dia >= 90) && hr > 100) {
      findings.push({ title: 'Beban Kardiovaskular Tinggi', desc: 'Tekanan darah dan detak jantung tinggi secara bersamaan meningkatkan risiko serangan jantung.' });
      recommendations.push('SEGERA kurangi aktivitas fisik berat dan lakukan pemeriksaan EKG ke dokter.');
    }

    if (formData.riwayatKeluarga.diabetes || formData.riwayatKeluarga.hipertensi || formData.riwayatKeluarga.jantung) {
      findings.push({ title: 'Riwayat Genetik Penyakit Kronis', desc: 'Ada keluarga inti yang memiliki penyakit bawaan.' });
      recommendations.push('Rutin lakukan medical check-up (Cek Gula Darah dan Kolesterol) minimal setahun sekali.');
    }

    if (formData.gejalaFisik.batukLama || formData.gejalaFisik.sesakNapas) {
      findings.push({ title: 'Risiko Infeksi Pernapasan', desc: 'Anda mengalami batuk >2 minggu atau sesak napas.' });
      recommendations.push('Gunakan masker dan SEGERA periksa ke Puskesmas/RS untuk screening paru dan tes dahak (TBC).');
      riskLevel = 'Tinggi';
    }

    const mentalSymptoms = Object.values(formData.gejalaMental).filter(Boolean).length;
    if (mentalSymptoms >= 3) {
      findings.push({ title: 'Indikasi Stres Ringan/Sedang', desc: `Anda mencentang ${mentalSymptoms} gejala mental/emosional.` });
      recommendations.push('Istirahat cukup (7-8 jam/hari) dan gunakan fitur Mood Tracker. Jika merasa kewalahan, pertimbangkan konseling.');
    }

    const durasi = parseInt(formData.durasiRokok) || 0;
    
    if (formData.merokok === 'Ya' || formData.paparanRokok !== 'Tidak Pernah') {
       const isSmoker = formData.merokok === 'Ya';
       const exposureText = isSmoker ? 'sebagai perokok aktif' : `terpapar asap rokok (${formData.paparanRokok})`;
       
       if (durasi >= 5 || formData.paparanRokok === 'Setiap Hari') {
          findings.push({ title: 'Risiko Kerusakan Paru & Pembuluh Darah', desc: `Sudah ${durasi} tahun ${exposureText}.` });
          recommendations.push('Lakukan rontgen dada secara berkala dan konsumsi antioksidan tinggi (buah/sayur).');
          riskLevel = 'Tinggi';
       } else {
          recommendations.push('Berhenti merokok/hindari asap rokok untuk mencegah kerusakan organ jangka panjang.');
       }
    }

    if (formData.begadang === 'Ya') {
       recommendations.push('Kurangi begadang. Tidur malam hari penting untuk perbaikan sel imun tubuh.');
    }

    if (formData.polaMakan === 'Tidak Sehat') {
      findings.push({ title: 'Pola Makan Berisiko', desc: 'Konsumsi gula/lemak/gorengan terlalu sering.' });
      recommendations.push('Ganti camilan dengan buah-buahan dan kurangi minuman kemasan/manis.');
      if (riskLevel === 'Rendah') riskLevel = 'Sedang';
    } else if (formData.polaMakan === 'Kurang Sehat') {
      recommendations.push('Tingkatkan porsi sayuran hijau dan kurangi makanan olahan.');
    }

    if (findings.length === 0) {
      findings.push({ title: 'Kondisi Sehat', desc: 'Tidak terdeteksi keluhan signifikan.' });
      recommendations.push('Tetap pertahankan gaya hidup sehat, makan bergizi, dan olahraga teratur.');
    }

    return { imt, findings, recommendations, riskLevel };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const assessment = calculateRisk();

    try {
      const screeningData = {
        inputData: formData,
        assessment: assessment
      };
      
      // Use centralized Service
      await dataService.healthScreenings.add(user.uid, screeningData);
      
      setResult(assessment);
    } catch (err) {
      console.error("Gagal menyimpan skrining:", err);
      alert('Gagal menyimpan catatan skrining.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (result) {
    return (
      <div className="min-h-screen bg-background font-body text-on-background flex flex-col items-center justify-center p-4">
        <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-lg w-full border border-outline-variant/20 animate-in fade-in duration-500">
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/20">
            <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center shrink-0 border ${
                result.riskLevel === 'Tinggi' ? 'bg-error/10 text-error border-error/20' : 
                result.riskLevel === 'Sedang' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 'bg-success/10 text-success border-success/20'
            }`}>
              <span className="material-symbols-outlined text-3xl">{result.riskLevel === 'Tinggi' ? 'warning' : 'check_circle'}</span>
            </div>
            <div>
              <h2 className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">Hasil Screening</h2>
              <p className="text-xs font-bold mt-1 text-on-surface-variant uppercase tracking-widest">Risiko Bawaan: <span className={`ml-1 ${
                 result.riskLevel === 'Tinggi' ? 'text-error' : result.riskLevel === 'Sedang' ? 'text-tertiary' : 'text-success'
              }`}>{result.riskLevel}</span></p>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <h3 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest">Temuan Kondisi:</h3>
            <ul className="space-y-3">
              {result.findings.map((item, idx) => (
                <li key={idx} className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/10">
                  <span className="font-bold text-on-surface block text-sm mb-1">{item.title}</span>
                  <span className="text-xs text-on-surface-variant font-medium">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8 space-y-4">
            <h3 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest">Saran Khusus:</h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm font-medium text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                  <span className="pt-0.5">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={() => navigate('/health')}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm"
          >
            Selesai & Kembali ke Beranda
          </button>
        </div>
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

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <div className="glass-card p-5 rounded-2xl border-l-4 border-l-primary shadow-sm flex items-start gap-4">
           <span className="material-symbols-outlined text-primary text-2xl shrink-0">info</span>
           <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
             Sistem Penilaian Cerdas (Rule-Based AI) ini akan mengevaluasi kondisi Anda secara instan berdasarkan parameter medis terenkripsi.
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border border-outline-variant/20 shadow-sm">
            <h2 className="font-headline font-black text-xs text-on-surface-variant uppercase tracking-widest mb-6">Pengukuran Fisik</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
