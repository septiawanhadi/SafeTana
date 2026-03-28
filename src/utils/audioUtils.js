// File: src/utils/audioUtils.js

let audioCtx = null;
let oscillatorVolume = null;
let sirenOscillator = null;
let sirenInterval = null;

export const playSiren = () => {
  if (typeof window === 'undefined') return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (browser auto-play policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (sirenOscillator) {
      stopSiren(); // Ensure no overlaps
    }

    oscillatorVolume = audioCtx.createGain();
    // Default volume
    oscillatorVolume.gain.value = 0.5;
    oscillatorVolume.connect(audioCtx.destination);

    sirenOscillator = audioCtx.createOscillator();
    sirenOscillator.type = 'square';
    sirenOscillator.connect(oscillatorVolume);
    sirenOscillator.start();

    // Loop siren effect: high pitch (900Hz) then low pitch (400Hz)
    let isHigh = true;
    sirenInterval = setInterval(() => {
      if (sirenOscillator && audioCtx) {
        sirenOscillator.frequency.setTargetAtTime(
          isHigh ? 900 : 400,
          audioCtx.currentTime,
          0.1
        );
        isHigh = !isHigh;
      }
    }, 400);

  } catch (err) {
    console.error("Gagal memutar sirene darurat:", err);
  }
};

export const stopSiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch(e) {
      console.warn("Siren oscillator stop error:", e);
    }
    sirenOscillator = null;
  }

  if (oscillatorVolume) {
    oscillatorVolume.disconnect();
    oscillatorVolume = null;
  }
};
