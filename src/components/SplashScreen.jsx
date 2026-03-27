import React, { useEffect, useState, useRef } from 'react';

/**
 * SplashScreen — Ditampilkan sekali saat aplikasi pertama kali dibuka.
 * Versi Premium: Dilengkapi Interaction Bridge untuk Audio Cross-Browser.
 */
const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'tagline' | 'exit'
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const audioContextRef = useRef(null);
  const hasPlayedRef = useRef(false);

  // --- Sound Effect Logic ---
  const playChime = () => {
    if (hasPlayedRef.current) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Jika browser memblokir (suspended), tandai butuh interaksi
      if (ctx.state === 'suspended') {
        setNeedsInteraction(true);
        return;
      }

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

      // Chime: A4 -> C#5 -> E5
      playTone(440, 0.1, 0.6);
      playTone(554, 0.35, 0.7);
      playTone(659, 0.6, 1.1);
      
      hasPlayedRef.current = true;
      setNeedsInteraction(false);
    } catch (e) {
      console.warn("Audio autoplay blocked or unsupported:", e);
    }
  };

  const handleStart = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        playChime();
      });
    } else {
      playChime();
    }
    // Lanjutkan fase jika tertahan di 'needsInteraction'
    if (needsInteraction) {
       startAnimationPhases();
    }
  };

  const startAnimationPhases = () => {
    // Fase 1 — logo muncul, setelah 1.8 s tampilkan tagline
    const t1 = setTimeout(() => setPhase('tagline'), 1800);
    // Fase 2 — mulai fade-out layar setelah 4.0 s total
    const t2 = setTimeout(() => setPhase('exit'), 5800);
    // Fase 3 — panggil callback setelah animasi keluar selesai
    const t3 = setTimeout(() => onDone(), 6600);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  };

  useEffect(() => {
    playChime();
    
    // Jika tidak butuh interaksi (sudah play), langsung jalankan fase
    // Jika butuh interaksi, fase akan berjalan setelah handleStart() dipanggil user
    let cleanup = null;
    if (navigator.userActivation && navigator.userActivation.isActive) {
       cleanup = startAnimationPhases();
    } else {
       // Jalankan saja animasinya, biarkan suara menyusul jika user klik di tengah jalan
       cleanup = startAnimationPhases();
    }

    return () => { if (cleanup) cleanup(); };
  }, []);

  return (
    <div
      className="splash-overlay relative"
      data-phase={phase}
      aria-label="SafeTana AI Loading"
      role="status"
      onClick={handleStart} // Global click bridge
    >
      <div className="splash-bg" />

      <div className="splash-content">
        <div className="splash-logo-wrap" data-phase={phase}>
          <img
            src="/logo.png"
            alt="SafeTana AI Logo"
            className="w-16 h-16 object-contain"
          />
        </div>

        <div className="splash-app-name" data-phase={phase}>
          <span className="text-white">Safe</span>
          <span className="text-error">Tana</span>
          <span className="text-primary text-[1.2rem] align-super font-black ml-1">AI</span>
        </div>

        <p className="splash-tagline" data-phase={phase === 'tagline' || phase === 'exit' ? 'show' : 'hidden'}>
          Cerdas berbagi, siap mitigasi &amp; peduli kesehatan
        </p>

        <div className="splash-dots" data-phase={phase}>
          <span /><span /><span />
        </div>

        {/* INTERACTION BRIDGE UI */}
        {needsInteraction && !hasPlayedRef.current && phase !== 'exit' && (
           <div className="mt-8 animate-pulse">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                 Tap anywhere to start experience
              </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;
