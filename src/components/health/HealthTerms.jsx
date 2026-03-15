import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HealthTerms = () => {
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
           <h1 className="text-lg font-bold">Syarat & Ketentuan</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700">
          
          <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-black mb-2 text-slate-900 dark:text-white">Syarat & Ketentuan</h1>
            <p className="text-xs text-slate-500 font-medium">Terakhir diperbarui: 6 November 2025</p>
          </div>

          <div className="space-y-8 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            
            <section>
              <p>Harap baca Syarat & Ketentuan ini dengan saksama sebelum menggunakan platform SafeTana AI Health.</p>
              <p className="mt-2">Dengan mengakses atau menggunakan Layanan, Anda setuju untuk terikat oleh Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun, Anda tidak diizinkan mengakses Layanan.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">1. Definisi</h2>
              <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Layanan:</strong> Merujuk pada aplikasi web SafeTana AI dan komponen Kesehatan (Klinik AI).</li>
                  <li><strong>Pengguna:</strong> Merujuk pada individu yang menggunakan Layanan.</li>
                  <li><strong>AI:</strong> Merujuk pada SafeTanaBot dan seluruh model kecerdasan buatan backend.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">2. Penggunaan Layanan</h2>
              <p className="mb-2">Anda menyatakan dan menjamin bahwa Anda memiliki kapasitas hukum untuk terikat oleh Ketentuan ini.</p>
              
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">A. Akun Pengguna</h4>
              <p>Anda bertanggung jawab penuh atas keamanan akun autentikasi Firebase Anda dan segala aktivitas di dalamnya.</p>
              
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">B. Larangan</h4>
              <ul className="list-disc pl-5 space-y-1">
                  <li>Melanggar hukum.</li>
                  <li>Eksploitasi sistem AI kami untuk hal di luar fungsi darurat dan kesehatan.</li>
                  <li>Menyebar hoax melalui dashboard mitigasi.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">3. Batasan Layanan Kesehatan Pintar</h2>
              <p className="mb-2 text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
                Layanan asisten AI kami BUKAN pengganti diagnosis dokter manusia dan BUKAN untuk keadaan gawat darurat medis yang butuh penanganan instan klinis.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                  <li>Nasihat dari SafeTanaBot murni probabilitas statistik dari algoritma mesin berskala besar.</li>
                  <li>Anda melepaskan kami dari pertanggungjawaban legal apa pun terkait keputusan medis yang Anda ambil sepihak berdasarkan output AI.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">4. Batasan Tanggung Jawab</h2>
              <p>Sejauh diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian langsung/tidak langsung dari ketidakmampuan menggunakan UI kami di kala krisis bencana lokal.</p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthTerms;
