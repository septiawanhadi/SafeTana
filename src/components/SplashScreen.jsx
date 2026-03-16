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

  // --- Sound Effect: startup chime via Web Audio API ---
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const playTone = (freq, startTime, duration, gainPeak = 0.18) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      // Ascending startup chime: tiga nada naik yang lembut
      playTone(440, 0.1, 0.6);   // A4
      playTone(554, 0.35, 0.7);  // C#5
      playTone(659, 0.6, 1.1);   // E5 – nada terakhir paling panjang & lembut
    } catch (e) {
      // Browser tidak mendukung atau autoplay diblokir — silent fallback
    }
  }, []);

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
