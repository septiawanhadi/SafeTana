import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, ShieldAlert } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const AiChatbot = ({ onClose, isSOS }) => {
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

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
  const genAI = new GoogleGenerativeAI(API_KEY);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Injecting Strategic Insight (BPBD & KOMDIGI) ke dalam System Prompt
      const prompt = `
        Anda adalah SafeTana AI Assistant. 
        Kepribadian: Tenang, Profesional, Inklusif, dan Empatik.
        Konteks Strategis:
        1. Gunakan data BPBD Jawa Barat: Prioritas risiko di Bandung adalah Sesar Lembang, Tanah Longsor, dan Cuaca Ekstrem.
        2. Edukasi Tas Siaga: Selalu ingatkan komponen utama (Dokumen penting, P3K, Air, Makanan tahan lama, Senter, Peluit).
        3. Format: Gunakan poin-poin sederhana (-) dan baris baru. Jangan gunakan simbol Markdown seperti asteris (*) atau hashtag (#).
        4. Inklusivitas: Pastikan instruksi mudah dipahami anak-anak dan lansia.
        
        Pertanyaan Pengguna: ${input}
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
    <div className="fixed bottom-6 right-6 z-[2000] w-[400px] h-[550px] bg-[#0f172a] border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
      
      {/* Header dengan identitas instansi */}
      <div className={`p-5 flex justify-between items-center text-white ${isSOS ? 'bg-red-600' : 'bg-blue-600 shadow-lg'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg">
            {isSOS ? <ShieldAlert size={20} className="animate-pulse" /> : <Bot size={20} />}
          </div>
          <div>
            <span className="text-xs font-black tracking-widest block leading-none uppercase">
              {isSOS ? 'Sinyal SOS Aktif' : 'Asisten SafeTana'}
            </span>
            <span className="text-[8px] font-bold opacity-70 uppercase tracking-tighter">
              Mitigasi BPBD & KOMDIGI
            </span>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-black/20 p-2 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-[11px] leading-relaxed whitespace-pre-wrap shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 italic ml-2">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            AI Menganalisis Protokol...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-5 bg-slate-900/80 border-t border-slate-800 flex gap-3">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan mitigasi atau lokasi aman..."
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-3 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 shadow-inner"
        />
        <button 
          type="submit" 
          disabled={isTyping}
          className="bg-white text-slate-900 p-3 rounded-2xl hover:bg-slate-200 transition-all active:scale-90 shadow-lg disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
