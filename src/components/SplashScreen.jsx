import React, { useEffect, useState } from 'react';

/**
 * SplashScreen — Ditampilkan sekali saat aplikasi pertama kali dibuka.
 * Animasi:
 *   0.0s  → layar gelap muncul
 *   0.3s  → logo fade-in + scale-in
 *   1.2s  → tagline muncul dari bawah
 *   2.8s  → seluruh layar fade-out
 *   3.2s  → onDone() dipanggil (komponen dilepas)
 */
const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'tagline' | 'exit'

  useEffect(() => {
    // Fase 1 — logo muncul, setelah 1.8 s tampilkan tagline
    const t1 = setTimeout(() => setPhase('tagline'), 1800);
    // Fase 2 — mulai fade-out layar setelah 4.0 s total
    const t2 = setTimeout(() => setPhase('exit'), 5800);
    // Fase 3 — panggil callback setelah animasi keluar selesai
    const t3 = setTimeout(() => onDone(), 6600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="splash-overlay"
      data-phase={phase}
      aria-label="SafeTana AI Loading"
      role="status"
    >
      {/* Latar belakang berdesain: gradient radial + partikel abstrak */}
      <div className="splash-bg" />

      <div className="splash-content">
        {/* Logo */}
        <div className="splash-logo-wrap" data-phase={phase}>
          <img
            src="/logo.png"
            alt="SafeTana AI Logo"
            className="splash-logo-img"
          />
        </div>

        {/* Nama App */}
        <div className="splash-app-name" data-phase={phase}>
          <span className="splash-name-safe">Safe</span>
          <span className="splash-name-tana">Tana</span>
          <span className="splash-name-ai"> AI</span>
        </div>

        {/* Tagline */}
        <p className="splash-tagline" data-phase={phase === 'tagline' || phase === 'exit' ? 'show' : 'hidden'}>
          Cerdas berbagi, siap mitigasi &amp; peduli kesehatan
        </p>

        {/* Loading dots */}
        <div className="splash-dots" data-phase={phase}>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
