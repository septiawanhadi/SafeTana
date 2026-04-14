/**
 * Rule-based diagnostic logic for SafeTana Health Screening
 * Based on medical standards for BMI, Blood Pressure, and common symptoms.
 */

export const calculateRisk = (formData) => {
  const findings = [];
  const recommendations = [];
  let riskLevel = 'Rendah';

  const bb = parseFloat(formData.bb);
  const tb = parseFloat(formData.tb) / 100;
  let imt = 0;

  // BMI Calculation
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

  // Blood Pressure Logic
  if (sis >= 140 || dia >= 90) {
    findings.push({ title: 'Indikasi Hipertensi', desc: `Tensi Anda ${sis}/${dia} mmHg. Tergolong tinggi.` });
    recommendations.push('Kurangi asupan garam (maksimal 1 sendok teh per hari). Jika berkelanjutan, konsultasikan ke dokter.');
    riskLevel = 'Tinggi';
  } else if ((sis >= 120 && sis < 140) || (dia >= 80 && dia < 90)) {
    findings.push({ title: 'Pra-Hipertensi', desc: `Tensi Anda ${sis}/${dia} mmHg. Mulai meningkat.` });
    recommendations.push('Perbanyak konsumsi sayur, buah, dan hindari stres untuk mencegah hipertensi.');
    if (riskLevel === 'Rendah') riskLevel = 'Sedang';
  }

  // Heart Rate Logic
  if (hr > 100) {
    findings.push({ title: 'Takikardia (Detak Jantung Cepat)', desc: `Denyut jantung Anda ${hr} BPM. Terlalu tinggi saat istirahat.` });
    recommendations.push('Hindari kafein dan rokok. Jika disertai sesak atau nyeri dada, segera ke IGD.');
    riskLevel = 'Tinggi';
  } else if (hr > 0 && hr < 60) {
    findings.push({ title: 'Bradikardia (Detak Jantung Lambat)', desc: `Denyut jantung Anda ${hr} BPM. Di bawah normal (kecuali atlet).` });
    recommendations.push('Jika Anda merasa pusing atau lemas, konsultasikan ke spesialis jantung.');
    if (riskLevel === 'Rendah') riskLevel = 'Sedang';
  }

  // Combined Vitals
  if ((sis >= 140 || dia >= 90) && hr > 100) {
    findings.push({ title: 'Beban Kardiovaskular Tinggi', desc: 'Tekanan darah dan detak jantung tinggi secara bersamaan meningkatkan risiko serangan jantung.' });
    recommendations.push('SEGERA kurangi aktivitas fisik berat dan lakukan pemeriksaan EKG ke dokter.');
  }

  // Genetic & History
  if (formData.riwayatKeluarga?.diabetes || formData.riwayatKeluarga?.hipertensi || formData.riwayatKeluarga?.jantung) {
    findings.push({ title: 'Riwayat Genetik Penyakit Kronis', desc: 'Ada keluarga inti yang memiliki penyakit bawaan.' });
    recommendations.push('Rutin lakukan medical check-up (Cek Gula Darah dan Kolesterol) minimal setahun sekali.');
  }

  // Respiratory Symptoms
  if (formData.gejalaFisik?.batukLama || formData.gejalaFisik?.sesakNapas) {
    findings.push({ title: 'Risiko Infeksi Pernapasan', desc: 'Anda mengalami batuk >2 minggu atau sesak napas.' });
    recommendations.push('Gunakan masker dan SEGERA periksa ke Puskesmas/RS untuk screening paru dan tes dahak (TBC).');
    riskLevel = 'Tinggi';
  }

  // Mental Health Symptoms
  const mentalSymptoms = formData.gejalaMental ? Object.values(formData.gejalaMental).filter(Boolean).length : 0;
  if (mentalSymptoms >= 3) {
    findings.push({ title: 'Indikasi Stres Ringan/Sedang', desc: `Anda mencentang ${mentalSymptoms} gejala mental/emosional.` });
    recommendations.push('Istirahat cukup (7-8 jam/hari) dan gunakan fitur Mood Tracker. Jika merasa kewalahan, pertimbangkan konseling.');
  }

  // Lifestyle - Smoking
  const durasi = parseInt(formData.durasiRokok) || 0;
  if (formData.merokok === 'Ya' || (formData.paparanRokok && formData.paparanRokok !== 'Tidak Pernah')) {
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

  // Lifestyle - Sleep
  if (formData.begadang === 'Ya') {
     recommendations.push('Kurangi begadang. Tidur malam hari penting untuk perbaikan sel imun tubuh.');
  }

  // Lifestyle - Diet
  if (formData.polaMakan === 'Tidak Sehat') {
    findings.push({ title: 'Pola Makan Berisiko', desc: 'Konsumsi gula/lemak/gorengan terlalu sering.' });
    recommendations.push('Ganti camilan dengan buah-buahan dan kurangi minuman kemasan/manis.');
    if (riskLevel === 'Rendah') riskLevel = 'Sedang';
  } else if (formData.polaMakan === 'Kurang Sehat') {
    recommendations.push('Tingkatkan porsi sayuran hijau dan kurangi makanan olahan.');
  }

  // Default Healthy Case
  if (findings.length === 0) {
    findings.push({ title: 'Kondisi Sehat', desc: 'Tidak terdeteksi keluhan signifikan.' });
    recommendations.push('Tetap pertahankan gaya hidup sehat, makan bergizi, dan olahraga teratur.');
  }

  return { imt, findings, recommendations, riskLevel };
};
