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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl max-w-lg w-full border border-slate-200 dark:border-slate-700 animate-in fade-in duration-500">
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                result.riskLevel === 'Tinggi' ? 'bg-red-100 text-red-500' : 
                result.riskLevel === 'Sedang' ? 'bg-amber-100 text-amber-500' : 'bg-emerald-100 text-emerald-500'
            }`}>
              {result.riskLevel === 'Tinggi' ? <AlertTriangle size={36} /> : <CheckCircle2 size={36} />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Hasil Screening</h2>
              <p className="text-sm font-bold mt-1">Risiko Bawaan: <span className={`${
                 result.riskLevel === 'Tinggi' ? 'text-red-500' : result.riskLevel === 'Sedang' ? 'text-amber-500' : 'text-emerald-500'
              }`}>{result.riskLevel}</span></p>
            </div>
          </div>

          <div className="mb-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Temuan Kondisi:</h3>
            <ul className="space-y-3">
              {result.findings.map((item, idx) => (
                <li key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-sm">{item.title}</span>
                  <span className="text-xs text-slate-500">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8 space-y-4">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Saran & Rekomendasi Khusus:</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={() => navigate('/health')}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-wider text-sm"
          >
            Selesai & Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/health')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 flex justify-center items-center gap-2">
            <Activity className="text-emerald-500" size={20} />
            <h1 className="font-bold text-lg">Skrining Kesehatan Menyeluruh</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
              Sistem Penilaian Cerdas (Rule-Based Expert System) ini akan mengevaluasi kondisi Anda secara instan berdasarkan parameter medis standar. Isi data sejujurnya.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Pengukuran Fisik</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Keterangan Usia</label>
                <input type="number" name="usia" value={formData.usia} onChange={handleChange} required className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" placeholder="Tahun" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Berat (KG)</label>
                  <input type="number" name="bb" value={formData.bb} onChange={handleChange} required min="20" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-center" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Tinggi (CM)</label>
                   <input type="number" name="tb" value={formData.tb} onChange={handleChange} required min="50" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-center" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Tensi Sistolik</label>
                <input type="number" name="sistolik" value={formData.sistolik} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" placeholder="Batas Atas (Cth: 120)" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Tensi Diastolik</label>
                <input type="number" name="diastolik" value={formData.diastolik} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" placeholder="Bawah (Cth: 80)" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Denyut Jantung (BPM)</label>
                <div className="relative">
                  <input type="number" name="denyutJantung" value={formData.denyutJantung} onChange={handleChange} className="w-full p-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" placeholder="Detak per menit" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">BPM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Kebiasaan Sehari-hari</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Merokok Aktif?</label>
                 <select name="merokok" value={formData.merokok} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold cursor-pointer">
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Paparan Asap Rokok</label>
                 <select name="paparanRokok" value={formData.paparanRokok} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold cursor-pointer">
                    <option value="Tidak Pernah">Tidak Pernah / Jarang</option>
                    <option value="Sering">Sering (Lingkungan Perokok)</option>
                    <option value="Setiap Hari">Sangat Sering (Tiap Hari)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Durasi Kebiasaan (Tahun)</label>
                 <input type="number" name="durasiRokok" value={formData.durasiRokok} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: 5" />
              </div>
              <div>
                 <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Pola Makan Umum</label>
                 <select name="polaMakan" value={formData.polaMakan} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold cursor-pointer">
                    <option value="Sehat">Sehat (Banyak Sayur/Buah)</option>
                    <option value="Kurang Sehat">Kurang Sehat (Jarang Sayur)</option>
                    <option value="Tidak Sehat">Tidak Sehat (Gorengan/Gula Tinggi)</option>
                 </select>
              </div>
              <div className="sm:col-span-2">
                 <label className="block text-xs font-bold mb-1.5 uppercase text-slate-500">Sering Begadang?</label>
                 <select name="begadang" value={formData.begadang} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold cursor-pointer">
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                 </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4 line-clamp-1">Riwayat Medis Sendiri</h2>
              <div className="space-y-3">
                {Object.keys(formData.riwayatPribadi).map(item => (
                  <label key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <input type="checkbox" name={`riwayatPribadi.${item}`} checked={formData.riwayatPribadi[item]} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500 dark:ring-offset-slate-800" />
                    <span className="text-sm font-bold capitalize">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4 line-clamp-1">Riwayat Medis Keluarga</h2>
              <div className="space-y-3">
                {Object.keys(formData.riwayatKeluarga).map(item => (
                  <label key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <input type="checkbox" name={`riwayatKeluarga.${item}`} checked={formData.riwayatKeluarga[item]} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500 dark:ring-offset-slate-800" />
                    <span className="text-sm font-bold capitalize">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

           <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-sm font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-4">Keluhan 2 Minggu Terakhir</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div className="col-span-1 md:col-span-2 text-xs font-bold text-slate-500 mb-1 border-b pb-2 dark:border-slate-700">Gejala Fisik Utama</div>
              {Object.keys(formData.gejalaFisik).map(item => (
                <label key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition bg-slate-50/50 dark:bg-slate-900/30">
                  <input type="checkbox" name={`gejalaFisik.${item}`} checked={formData.gejalaFisik[item]} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500 dark:ring-offset-slate-800" />
                  <span className="text-sm font-bold capitalize">{item.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
              <div className="col-span-1 md:col-span-2 text-xs font-bold text-slate-500 mb-1 mt-4 border-b pb-2 dark:border-slate-700">Gejala Mental / Emosional</div>
              {Object.keys(formData.gejalaMental).map(item => (
                <label key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition bg-slate-50/50 dark:bg-slate-900/30">
                  <input type="checkbox" name={`gejalaMental.${item}`} checked={formData.gejalaMental[item]} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded bg-slate-100 border-slate-300 focus:ring-emerald-500 dark:ring-offset-slate-800" />
                  <span className="text-sm font-bold capitalize">{item.replace(/([A-Z])/g, ' $1').trim()}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2">
            {submitting ? 'Menganalisa Data...' : 'Analisis Kesehatan Saya'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default HealthScreening;
