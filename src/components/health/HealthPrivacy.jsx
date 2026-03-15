import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HealthPrivacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
           <button 
            onClick={() => navigate('/health')} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
           >
              <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
           </button>
           <h1 className="text-lg font-bold">Pemberitahuan Privasi</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700">
          
          <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900 dark:text-white">Pemberitahuan Privasi</h1>
            <p className="text-xs text-slate-500 font-medium">Terakhir diperbarui: 6 November 2025</p>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            
            <section>
              <p>Selamat datang di SafeTana AI Health. Kami berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Pemberitahuan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda saat Anda menggunakan layanan kami.</p>
              <p className="mt-2">Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p className="mb-2">Kami mengumpulkan beberapa jenis informasi untuk berbagai tujuan guna menyediakan dan meningkatkan layanan kami kepada Anda.</p>
              
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">A. Data yang Anda Berikan Secara Langsung</h4>
              <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Data Identitas Pribadi:</strong> Nama, alamat email, nomor telepon, tanggal lahir, dan informasi identitas lainnya (mis: KTP) untuk verifikasi.</li>
                  <li><strong>Data Kesehatan:</strong> Riwayat medis, gejala, resep obat, hasil laporan mood, dan informasi lain yang Anda berikan selama menggunakan fitur kami.</li>
                  <li><strong>Data Lokasi:</strong> Posisi koordinat saat menggunakan fitur SOS atau pemetaan.</li>
              </ul>

              <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">B. Data yang Dikumpulkan Secara Otomatis</h4>
              <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Data Penggunaan:</strong> Informasi tentang cara Anda mengakses dan menggunakan layanan, termasuk alamat IP, jenis perangkat, sistem operasi, dan aktivitas aplikasi.</li>
                  <li><strong>Data Cookie:</strong> Kami menggunakan cookie dan teknologi pelacakan untuk memantau aktivitas sesi Anda.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. Bagaimana Kami Menggunakan Informasi Anda</h2>
              <ul className="list-disc pl-5 space-y-1">
                  <li>Untuk menyediakan dan memelihara layanan (mis: menghubungkan Anda dengan AI Asisten).</li>
                  <li>Untuk memverifikasi identitas Anda dan mengelola akun Anda.</li>
                  <li>Untuk memberikan rekomendasi kesehatan prediktif.</li>
                  <li>Untuk memantau penggunaan layanan dan mendeteksi masalah teknis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. Kepada Siapa Kami Mengungkapkan Informasi Anda</h2>
              <p className="mb-2">Kami tidak menjual data pribadi Anda. Kami hanya membagikan informasi dalam situasi berikut:</p>
              <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Penyedia Layanan:</strong> Untuk memfasilitasi hosting cloud dan infrastruktur AI (Data diproses tanpa informasi identitas langsung secara agresif).</li>
                  <li><strong>Kepatuhan Hukum:</strong> Jika diharuskan oleh hukum atau otoritas publik darurat bencana.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. Keamanan Data</h2>
              <p>Kami menerapkan langkah-langkah keamanan teknis (seperti Firebase Security Rules dan enkripsi TLS) untuk melindungi data Anda. Namun, tidak ada metode transmisi internet yang 100% aman.</p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthPrivacy;
