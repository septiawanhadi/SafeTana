import React, { useState, useRef, useEffect } from 'react';
import { sanitizeInput } from './securityUtils';
import { disasterAiService } from './services/disasterAiService';

const AiChatbot = ({ onClose, isSOS, userLocation }) => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: isSOS
        ? `🚨 PROTOKOL SOS AKTIF\n\nLokasi Anda sedang dilacak. Tetap tenang. Waspadai risiko kerusakan struktur bangunan. Segera menuju ke area terbuka dan hemat baterai Anda.`
        : `SafeTana AI siap membantu. Saya terhubung dengan data BPBD & kebencanaan regional. Apa yang bisa saya bantu hari ini?`
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ''));
      utterance.lang = 'id-ID';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const cleanInput = sanitizeInput(input);
    setMessages(prev => [...prev, { role: 'user', text: cleanInput }]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await disasterAiService.getAssistantResponse(cleanInput, userLocation);
      setMessages(prev => [...prev, { role: 'bot', text: responseText }]);
    } catch {
      // Offline fallback dictionary
      const text = cleanInput.toLowerCase();
      let fallbackText = "Sinyal sangat lemah/terputus. Hubungi 112 untuk keadaan darurat bencana.";
      
      if (text.includes('gempa')) {
        fallbackText = "Sinyal lemah. [Info Darurat Offline]: Saat gempa, jauhi jendela dan lemari. Berlindung di bawah meja kuat (Drop, Cover, Hold on). Bila di luar, jauhi gedung, pohon, dan tiang listrik.";
      } else if (text.includes('banjir')) {
        fallbackText = "Sinyal lemah. [Info Darurat Offline]: Segera evakuasi ke tempat yang lebih tinggi. Cabut semua peralatan listrik. Jangan menerobos arus air, sekecil apapun arusnya.";
      } else if (text.includes('api') || text.includes('kebakaran')) {
        fallbackText = "Sinyal lemah. [Info Darurat Offline]: Segera keluar bangunan. Berjalan merangkak jika ada asap (asap mengarah ke atas). Tutup mulut/hidung dengan kain basah. Hubungi pemadam kebakaran.";
      } else if (text.includes('luka') || text.includes('darah') || text.includes('pendarahan')) {
        fallbackText = "Sinyal lemah. [Info Darurat Offline]: Tekan luka langsung dengan kain bersih atau perban untuk menghentikan pendarahan. Cari bantuan medis segera. Hubungi 112 atau 119.";
      } else if (text.includes('tsunami')) {
        fallbackText = "Sinyal lemah. [Info Darurat Offline]: Jika Anda berada di pesisir dan merasakan gempa kuat, JANGAN TUNGGU SIRINE. Segera berlari ke dataran tinggi atau gedung bertingkat yang kokoh.";
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: fallbackText }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-[420px] h-[600px] max-h-[80vh] bg-[#0b1326] rounded-lg shadow-2xl z-[9999] flex flex-col overflow-hidden border-t-2 border-primary/20 animate-in fade-in slide-in-from-bottom-10">
      {/* AI Header */}
      <header className={`p-4 flex items-center justify-between border-b border-outline-variant/10 ${isSOS ? 'bg-error text-white' : 'bg-[#2d3449]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{isSOS ? 'emergency_home' : 'smart_toy'}</span>
          </div>
          <div>
            <h3 className="font-display font-black text-xs uppercase tracking-widest leading-none mb-1">Asisten Penjaga</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Sinkronisasi Protokol Aktif</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-outline-variant/20 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-xl text-on-surface-variant">close</span>
        </button>
      </header>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-lg text-sm font-medium leading-relaxed tracking-tight shadow-lg ${
              msg.role === 'user' 
              ? 'bg-[#c3c0ff] text-[#1d00a5] rounded-tr-none' 
              : 'bg-[#131b2e] text-[#dae2fd] rounded-tl-none border border-outline-variant/10'
            }`}>
              {msg.text}
              {msg.role === 'bot' && (
                <button onClick={() => isSpeaking ? window.speechSynthesis.cancel() : speakText(msg.text)} className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">{isSpeaking ? 'volume_off' : 'volume_up'}</span>
                  {isSpeaking ? 'Hentikan Suara' : 'Putar Suara'}
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex items-center gap-3 ml-2">
             <div className="flex gap-1">
               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
             </div>
             <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Menganalisis Titik Aman...</span>
           </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Dock */}
      <form onSubmit={handleSend} className="p-4 bg-[#2d3449] border-t border-outline-variant/10 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan Anda..."
          className="flex-1 bg-[#131b2e] border border-outline-variant/20 rounded-lg px-5 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:opacity-30"
        />
        <button type="submit" disabled={isTyping} className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50">
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
};

export default AiChatbot;
