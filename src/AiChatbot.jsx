import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, ShieldAlert, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sanitizeInput } from './securityUtils';
import { calculateDistance } from './utils/geoUtils';

const AiChatbot = ({ onClose, isSOS, userLocation, reports }) => {
  // Initial Message dengan muatan edukasi Tas Siaga & Sesar Lembang sesuai insight BPBD
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: isSOS
        ? `🚨 SINYAL SOS DITERIMA - PROTOKOL BPBD JABAR\n\nTetap tenang. Lokasi Anda telah dicatat oleh sistem SafeTana. Sambil menunggu bantuan, lakukan langkah prioritas ini:\n\n1. Jika di Bandung Raya: Waspadai struktur bangunan, jauhi kaca (Risiko Sesar Lembang).\n2. Cari tempat terbuka: Lindungi kepala Anda.\n3. Hemat baterai: Gunakan hanya untuk komunikasi darurat.\n4. Identitas: Siapkan KTP atau tanda pengenal jika ada.`
        : `Selamat datang di SafeTana AI.\n\nSaya asisten mitigasi yang dibekali data BPBD Jabar & KOMDIGI. Apa yang ingin Anda ketahui?\n\n- Apa itu Tas Siaga Bencana (Penting)?\n- Info risiko Sesar Lembang di Bandung.\n- Cari Puskesmas 24 jam terdekat.\n- Panduan keselamatan banjir & longsor.`
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  const getNearbyHazards = () => {
    if (!userLocation || !reports || reports.length === 0) return [];

    return reports.map(hazard => {
      const dist = calculateDistance(
        userLocation[0], userLocation[1],
        hazard.position[0], hazard.position[1]
      );
      return { ...hazard, distance: dist };
    })
      .filter(h => h.distance < 500)
      .sort((a, b) => a.distance - b.distance);
  };

  const generateThreatMatrix = (nearbyHazards) => {
    if (nearbyHazards.length === 0) return "Lokasi Anda saat ini terpantau aman dari bencana besar terdekat.";

    return nearbyHazards.map(h =>
      `- ${h.type} di ${h.loc} (Jarak: ${h.distance.toFixed(1)} km). Sumber: ${h.source}`
    ).join('\n');
  };

  const nearbyHazards = getNearbyHazards();
  const closestHazard = nearbyHazards.length > 0 ? nearbyHazards[0] : null;
  const threatMatrixText = generateThreatMatrix(nearbyHazards);

  let riskLevel = 'Aman';
  let riskColor = 'bg-emerald-500';
  if (closestHazard) {
    if (closestHazard.distance < 50) {
      riskLevel = 'Bahaya Tinggi';
      riskColor = 'bg-red-500 animate-pulse';
    } else if (closestHazard.distance <= 200) {
      riskLevel = 'Siaga';
      riskColor = 'bg-yellow-500';
    } else {
      riskLevel = 'Pantauan';
      riskColor = 'bg-blue-500';
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      // Mencegah bacaan karakter markdown yang mungkin terlewat
      utterance.text = text.replace(/[*#_]/g, ''); 
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Sanitize input before further processing or rendering to prevent XSS
    const cleanInput = sanitizeInput(input);

    const userMsg = { role: 'user', text: cleanInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Injecting Strategic Insight (BPBD & KOMDIGI) ke dalam System Prompt
      const prompt = `
        Anda adalah SafeTana AI Assistant darurat terintegrasi dengan BPBD.
        Kepribadian: Tenang, Profesional, Inklusif, dan Empatik.
        Konteks Lokasi: Pengguna berada di koordinat ${userLocation ? `[${userLocation[0]}, ${userLocation[1]}]` : 'tidak diketahui'}.
        
        Konteks Matriks Ancaman Spasial (Radius < 500km):
        ${threatMatrixText}
        
        Konteks Strategis & Prosedur:
        1. Jika ada bencana di bawah radius 50km pada matriks, berikan peringatan keras namun tenang dan instruksikan langkah evakuasi segera jika relevan.
        2. Jika pengguna bertanya tentang keamanannya, analisis jarak bencana dari matriks.
        3. Prioritaskan panduan mitigasi berdasarkan jenis bencana.
        4. Edukasi Tas Siaga jika ditanya/relevan (Dokumen, P3K, Air, Senter, Peluit).
        5. Format: Gunakan poin-poin sederhana (-) dan baris baru. Jangan gunakan simbol Markdown bintang ganda (*) atau hashtag (#).
        
        Pertanyaan Pengguna: ${cleanInput}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Sanitasi teks agar bersih dari karakter markdown yang tidak didukung
      const cleanText = text.replace(/[#*`]/g, '');
      setMessages(prev => [...prev, { role: 'bot', text: cleanText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Maaf, sistem sedang sibuk. Jika darurat, segera hubungi 112 atau cari petugas BPBD terdekat." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-[5000] w-full h-full md:w-[400px] md:h-[550px] bg-slate-50 dark:bg-[#0f172a] md:border border-slate-200 dark:border-slate-800 md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 transition-colors duration-300">

      {/* Header dengan identitas instansi */}
      <div className={`p-4 md:p-5 flex justify-between items-center text-white ${isSOS ? 'bg-red-600' : 'bg-blue-600 shadow-lg'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
            {isSOS ? <ShieldAlert size={20} className="animate-pulse" /> : <Bot size={20} />}
          </div>
          <div>
            <span className="text-xs md:text-sm font-black tracking-widest block leading-none uppercase">
              {isSOS ? 'Sinyal SOS Aktif' : 'Asisten SafeTana'}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[8px] md:text-[9px] font-bold opacity-70 uppercase tracking-tighter">
                Mitigasi BPBD & KOMDIGI
              </span>
              {!isSOS && userLocation && (
                <div className="flex items-center gap-1 ml-2 bg-black/20 px-2 py-0.5 rounded-full" title={closestHazard ? `${closestHazard.type} ${closestHazard.distance.toFixed(1)}km` : 'Aman'}>
                  <div className={`w-1.5 h-1.5 rounded-full ${riskColor}`}></div>
                  <span className="text-[7px] md:text-[8px] font-bold uppercase">{riskLevel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => { stopSpeaking(); onClose(); }} 
          className="hover:bg-black/20 p-2 rounded-full transition-colors active:scale-90"
          aria-label="Tutup Asisten"
        >
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-white dark:bg-slate-950/20 custom-scrollbar transition-colors duration-300">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[11px] leading-relaxed whitespace-pre-wrap shadow-sm ${msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-tr-none'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700/50'
              }`}>
              {msg.text}
              
              {/* Tombol TTS Khusus Balasan Bot */}
              {msg.role === 'bot' && (
                <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-700/50 flex justify-end">
                  {isSpeaking && window.speechSynthesis.speaking ? (
                    <button 
                      onClick={stopSpeaking}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-200 dark:border-red-500/30"
                      aria-label="Hentikan Pembacaan Audio"
                      title="Hentikan Suara"
                    >
                      <VolumeX size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest hidden md:inline">Stop</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => speakText(msg.text)}
                      className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                      aria-label="Bacakan Pesan Audio"
                      title="Bacakan Pesan"
                    >
                      <Volume2 size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest hidden md:inline">Baca</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 italic ml-2">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            AI Menganalisis Protokol...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Auto-Trigger SOS UI if threat < 20km */}
      {!isSOS && closestHazard && closestHazard.distance < 20 && (
        <div className="bg-red-50 dark:bg-red-500/20 border-t border-red-200 dark:border-red-500/50 p-3 md:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={14} className="animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider line-clamp-2 leading-tight">Awas! {closestHazard.type} berjarak {closestHazard.distance.toFixed(1)}km</span>
          </div>
          <button
            onClick={() => setInput('Tunjukkan Rute Evakuasi atau Titik Aman terdekat dari lokasi saya sekarang.')}
            className="text-[8px] md:text-[9px] font-black uppercase bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 transition px-2 py-1.5 md:px-3 rounded-full text-white shadow-lg whitespace-nowrap"
          >
            Tanya Titik Evakuasi
          </button>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 md:p-5 bg-white dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex gap-2 md:gap-3 shrink-0 transition-colors duration-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan mitigasi atau lokasi aman..."
          className="flex-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
        />
        <button
          type="submit"
          disabled={isTyping}
          className="bg-blue-600 text-white dark:bg-white dark:text-slate-900 p-3 rounded-xl md:rounded-2xl hover:bg-blue-700 dark:hover:bg-slate-200 transition-all active:scale-90 shadow-lg disabled:opacity-50 shrink-0"
          aria-label="Kirim Pesan"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AiChatbot;
