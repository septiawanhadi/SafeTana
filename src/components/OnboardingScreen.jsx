import React, { useState } from 'react';
import { Eye, Rocket, ShieldCheck, ChevronRight, CheckCircle } from 'lucide-react';

/**
 * OnboardingScreen
 * Ditampilkan sekali per sesi setelah splash screen.
 * Props:
 *   onDone() — callback saat user klik "Mulai" di slide terakhir
 */
const OnboardingScreen = ({ onDone }) => {
  const [slide, setSlide] = useState(0); // 0 = Tentang Kami, 1 = Privasi

  const handleNext = () => {
    if (slide < 1) setSlide(1);
    else onDone();
  };

  return (
    <div className="onb-overlay">
      {/* Slide indicator */}
      <div className="onb-dots">
        <span className={slide === 0 ? 'onb-dot onb-dot-active' : 'onb-dot'} />
        <span className={slide === 1 ? 'onb-dot onb-dot-active' : 'onb-dot'} />
      </div>

      {/* ───── SLIDE 0 — TENTANG KAMI ───── */}
      <div className={`onb-slide ${slide === 0 ? 'onb-slide-visible' : 'onb-slide-hidden'}`}>
        {/* Hero */}
        <div className="onb-hero">
          <div className="onb-logo-wrap">
            <img src="/logo.png" alt="SafeTana AI Logo" className="onb-logo-img" />
          </div>
          <h1 className="onb-hero-title">
            Safe<span className="onb-red">Tana</span><span className="onb-blue"> AI</span>
          </h1>
          <p className="onb-hero-sub">
            Cerdas berbagi, siap mitigasi &amp; peduli kesehatan
          </p>
        </div>

        {/* Cards */}
        <div className="onb-cards">
          <div className="onb-card">
            <div className="onb-card-icon onb-icon-blue">
              <Eye size={22} />
            </div>
            <h3 className="onb-card-title">Visi Kami</h3>
            <p className="onb-card-body">
              Menjadi platform keamanan dan kesehatan digital terdepan yang memberikan
              dampak perlindungan preventif berkelanjutan bagi masyarakat di area rawan krisis.
            </p>
          </div>

          <div className="onb-card">
            <div className="onb-card-icon onb-icon-green">
              <Rocket size={22} />
            </div>
            <h3 className="onb-card-title">Misi Kami</h3>
            <ul className="onb-card-list">
              <li>Deteksi dini bencana &amp; peringatan berbasis lokasi real-time.</li>
              <li>Peta titik aman (Safe Zone) geospasial yang akurat.</li>
              <li>Ekosistem kesehatan prediktif berbasis AI — SafeTanaBot.</li>
            </ul>
          </div>
        </div>

        {/* Developers */}
        <div className="flex flex-col gap-2 w-full">
          <div className="onb-founder">
            <div className="onb-founder-avatar border-blue-400">
              <img src="/Septi.png" alt="Septiawan Hadi Prasetyo" className="onb-founder-img" />
            </div>
            <div>
              <p className="onb-founder-name">Septiawan Hadi Prasetyo</p>
              <p className="onb-founder-role">Lead Developer</p>
            </div>
          </div>
          
          <div className="onb-founder">
            <div className="onb-founder-avatar border-emerald-400">
              <img src="/Restu.png" alt="Restu Utami" className="onb-founder-img" />
            </div>
            <div>
              <p className="onb-founder-name">Restu Utami</p>
              <p className="onb-founder-role">Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* ───── SLIDE 1 — PEMBERITAHUAN PRIVASI ───── */}
      <div className={`onb-slide ${slide === 1 ? 'onb-slide-visible' : 'onb-slide-hidden'}`}>
        <div className="onb-priv-header">
          <div className="onb-priv-icon">
            <ShieldCheck size={30} />
          </div>
          <h2 className="onb-priv-title">Pemberitahuan Privasi</h2>
          <p className="onb-priv-updated">Terakhir diperbarui: 6 November 2025</p>
        </div>

        <div className="onb-priv-body">
          <p>
            Selamat datang di SafeTana AI. Kami berkomitmen melindungi privasi dan keamanan
            data pribadi Anda sesuai peraturan yang berlaku.
          </p>

          <div className="onb-priv-section">
            <h4>1. Informasi yang Kami Kumpulkan</h4>
            <ul>
              <li><strong>Data Identitas:</strong> Nama, email, nomor telepon untuk verifikasi akun.</li>
              <li><strong>Data Kesehatan:</strong> Riwayat medis, gejala, dan laporan mood Anda.</li>
              <li><strong>Data Lokasi:</strong> Koordinat posisi saat menggunakan fitur SOS / pemetaan.</li>
              <li><strong>Data Penggunaan:</strong> IP, jenis perangkat, dan aktivitas aplikasi.</li>
            </ul>
          </div>

          <div className="onb-priv-section">
            <h4>2. Penggunaan Data Anda</h4>
            <ul>
              <li>Menyediakan layanan AI asisten &amp; deteksi bencana.</li>
              <li>Verifikasi identitas dan manajemen akun.</li>
              <li>Rekomendasi kesehatan prediktif berbasis riwayat.</li>
            </ul>
          </div>

          <div className="onb-priv-section">
            <h4>3. Keamanan Data</h4>
            <p>
              Kami menerapkan Firebase Security Rules dan enkripsi TLS untuk melindungi data Anda.
              Kami tidak menjual data pribadi Anda kepada pihak ketiga manapun.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button className="onb-btn" onClick={handleNext}>
        {slide === 0 ? (
          <>Selanjutnya <ChevronRight size={18} /></>
        ) : (
          <><CheckCircle size={18} /> Saya Setuju &amp; Mulai</>
        )}
      </button>

      {/* Skip — hanya tersedia di slide 0 */}
      {slide === 0 && (
        <button className="onb-skip" onClick={onDone}>
          Lewati
        </button>
      )}
    </div>
  );
};

export default OnboardingScreen;
