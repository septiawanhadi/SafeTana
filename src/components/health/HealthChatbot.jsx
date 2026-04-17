import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, RefreshCw, HeartPulse } from 'lucide-react';

// Integration: Service Pattern
import { aiService } from '../../services/health/aiService';

const HealthChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo, saya SafeTana AI 🌿. Saya asisten medis & konseling pasca bencana Anda. Bagaimana perasaan atau kondisi kesehatan Anda hari ini?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInputText = input.trim();
    const userMessage = { id: Date.now(), sender: 'user', text: userInputText };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare history for aiService (excluding welcome message)
      const history = messages
        .filter(m => m.id !== 1) 
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Call the centralized aiService with privacy mode support
      const responseText = await aiService.getHealthChatResponse(history, userInputText, isPrivacyMode);
      
      const botResponse = { id: Date.now() + 1, sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("HealthChatbot AI Error:", error);
      const errorMessage = { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "Maaf, koneksi saya sedang terganggu. Tetap tenang, dan jika ini kesehatan darurat, segera hubungi petugas terdekat atau tekan tombol SOS." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Hapus semua riwayat chat ini?")) {
      setMessages([
        {
          id: Date.now(),
          sender: 'bot',
          text: 'Sesi chat telah diperbarui. Ada yang ingin ditanyakan lagi?'
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] pt-16 pb-28 bg-background font-body text-on-background">
      
      {/* HEADER */}
      <header className="glass-card shadow-sm shrink-0 border-b border-outline-variant/20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/health')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-full transition text-on-surface-variant">
               <span className="material-symbols-outlined">arrow_back</span>
             </button>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
                 <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
               </div>
               <div>
                  <h1 className="font-headline font-black text-sm leading-tight text-on-surface tracking-tight">SafeTana AI</h1>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Klinik AI & Konseling</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsPrivacyMode(!isPrivacyMode)} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${isPrivacyMode ? 'bg-tertiary/10 border-tertiary text-tertiary' : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant opacity-60'}`}
              title={isPrivacyMode ? 'Mode Privasi (Null Claw) Aktif' : 'Gunakan Cloud AI (Gemini)'}
            >
               <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isPrivacyMode ? "'FILL' 1" : "" }}>{isPrivacyMode ? 'security' : 'cloud'}</span>
               <span className="text-[10px] font-black uppercase tracking-widest">{isPrivacyMode ? 'Local' : 'Cloud'}</span>
            </button>
            <button onClick={handleReset} className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition" title="Mulai ulang chat">
               <span className="material-symbols-outlined text-xl">autorenew</span>
            </button>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full custom-scrollbar relative">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
         
         <div className="space-y-6 relative z-10">
            <div className="text-center text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-[0.2em] my-6 flex items-center justify-center gap-2">
               <span className="h-px w-8 bg-outline-variant/20"></span>
               Percakapan Terenkripsi
               <span className="h-px w-8 bg-outline-variant/20"></span>
            </div>
            
            {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* AVATAR */}
                    <div className="shrink-0 mt-auto">
                      {msg.sender === 'bot' ? (
                         <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex justify-center items-center shadow-lg border-2 border-background">
                           <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                         </div>
                      ) : (
                         <div className="w-8 h-8 bg-surface-container-high text-on-surface-variant rounded-full flex justify-center items-center border-2 border-background">
                           <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                         </div>
                      )}
                    </div>

                    {/* BUBBLE */}
                    <div className={`p-4 shadow-sm relative ${
                       msg.sender === 'user'
                        ? 'bg-primary text-on-primary rounded-[1.5rem] rounded-br-none' 
                        : 'glass-card border border-outline-variant/20 rounded-[1.5rem] rounded-bl-none'
                    }`}>
                       {msg.sender === 'bot' && msg.text.includes('NullClaw') && (
                         <div className="absolute -top-2 -right-2 bg-tertiary text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                           <span className="material-symbols-outlined text-[10px]">bolt</span>
                           NULLCLAW
                         </div>
                       )}
                       <p className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'font-medium' : 'text-on-surface'}`}>
                         {msg.text}
                       </p>
                    </div>

                  </div>
               </div>
            ))}

            {isTyping && (
               <div className="flex justify-start animate-in fade-in duration-300">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="shrink-0 mt-auto">
                       <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex justify-center items-center shadow-lg border-2 border-background">
                         <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                       </div>
                    </div>
                    <div className="p-4 glass-card border border-outline-variant/20 rounded-[1.5rem] rounded-bl-none flex gap-1.5 items-center justify-center min-w-[4rem]">
                       <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                       <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
               </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
         </div>
      </main>

      {/* INPUT AREA */}
      <footer className="glass-card p-4 shrink-0 border-t border-outline-variant/20 relative z-10">
         <div className="max-w-3xl mx-auto relative flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ceritakan keluhan Anda..."
              className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-full py-4 px-6 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner placeholder:text-on-surface-variant/50"
            />
            <button
               onClick={handleSend}
               disabled={!input.trim()}
               className="shrink-0 w-14 h-14 flex items-center justify-center bg-primary hover:bg-primary/90 disabled:bg-surface-container-high disabled:text-on-surface-variant/30 text-on-primary rounded-full transition-all active:scale-95 disabled:active:scale-100 shadow-lg disabled:shadow-none"
            >
               <span className="material-symbols-outlined text-xl ml-1">send</span>
            </button>
         </div>
         <p className="text-center text-[10px] text-on-surface-variant/50 mt-4 font-bold uppercase tracking-[0.2em]">
           SafeTana AI ditujukan untuk dukungan awal. Hubungi 112 untuk keadaan darurat.
         </p>
      </footer>
    </div>
  );
};

export default HealthChatbot;
