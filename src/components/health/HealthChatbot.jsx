import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, RefreshCw } from 'lucide-react';

const HealthChatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Halo! Aku Sagabot 🤖, asisten AI untuk layanan kesehatan Anda. Anda bisa menanyakan gejala, rekomendasi gaya hidup sehat, atau info layanan darurat. Ada yang bisa dibantu hari ini?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Dummy delay untuk respon AI
    setTimeout(() => {
      const responses = [
        "Baik, saya catat. Untuk gejala tersebut, disarankan untuk banyak minum air putih dan istirahat yang cukup. Namun jika berlanjut lebih dari 3 hari, sebaiknya konsultasi ke dokter ya.",
        "Menarik. Berdasarkan data kesehatan umum, itu bisa jadi pertanda kelelahan. Jangan lupa makan teratur.",
        "Saya mengerti. Ingat, kesehatan mental sama pentingnya dengan fisik. Anda bisa coba gunakan fitur Mood Tracker di menu kami.",
        "Jika kondisinya darurat, seperti sesak napas berat atau nyeri dada, segera tekan tombol SOS di halaman utama SafeTana!",
        "Rekomendasi yang baik untuk itu adalah meningkatkan asupan vitamin C dan olahraga ringan selama 15 menit setiap hari."
      ];
      const botResponse = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1200);
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
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 shadow-sm shrink-0 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate('/health')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
               <ArrowLeft size={20} />
             </button>
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                 <Bot size={18} />
               </div>
               <div>
                  <h1 className="font-bold text-sm leading-tight">Sagabot</h1>
                  <p className="text-[10px] text-green-500 font-medium">Asisten Kesehatan Aktif</p>
               </div>
             </div>
          </div>
          
          <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition" title="Mulai ulang chat">
             <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full custom-scrollbar">
         <div className="space-y-6">
            <div className="text-center text-xs text-slate-400 font-medium uppercase tracking-widest my-4">Percakapan Terenkripsi</div>
            
            {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* AVATAR */}
                    <div className="shrink-0">
                      {msg.sender === 'bot' ? (
                         <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex justify-center items-center shadow-md">
                           <Bot size={16} />
                         </div>
                      ) : (
                         <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex justify-center items-center">
                           <User size={16} />
                         </div>
                      )}
                    </div>

                    {/* BUBBLE */}
                    <div className={`p-4 rounded-2xl shadow-sm ${
                       msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}>
                       <p className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'font-medium' : ''}`}>
                         {msg.text}
                       </p>
                    </div>

                  </div>
               </div>
            ))}

            {isTyping && (
               <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="shrink-0">
                       <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex justify-center items-center shadow-md">
                         <Bot size={16} />
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none flex gap-1 items-center">
                       <div className="w-2 h-2 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                       <div className="w-2 h-2 bg-slate-300 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
               </div>
            )}
            
            <div ref={messagesEndRef} />
         </div>
      </main>

      {/* INPUT AREA */}
      <footer className="bg-white dark:bg-slate-800 p-4 shrink-0 border-t border-slate-200 dark:border-slate-700">
         <div className="max-w-3xl mx-auto relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Ceritakan keluhan Anda..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
            <button
               onClick={handleSend}
               disabled={!input.trim()}
               className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full transition-all active:scale-95 disabled:active:scale-100"
            >
               <Send size={18} />
            </button>
         </div>
         <p className="text-center text-[9px] text-slate-400 mt-3 font-medium">Sagabot dapat membuat kesalahan. Selalu periksa informasi medis dan konsultasikan gejala serius ke dokter RS.</p>
      </footer>
    </div>
  );
};

export default HealthChatbot;
