import React, { useEffect, useState } from 'react';
import { useDynamicIsland } from '../../contexts/DynamicIslandContext';

const DynamicIsland = () => {
  const { 
    islandType, setIslandType, 
    isExpanded, setIsExpanded,
    musicData, togglePlay, stopMusic,
    notificationData 
  } = useDynamicIsland();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (islandType) {
      setIsVisible(true);
      // Auto-expand slightly on notification/reminder
      if (islandType !== 'music') {
        setTimeout(() => setIsExpanded(true), 200);
        // Auto-shrink and hide after 6 seconds for non-music
        const timer = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(() => setIslandType(null), 500);
        }, 6000);
        return () => clearTimeout(timer);
      }
    } else {
      setTimeout(() => setIsVisible(false), 500); 
    }
  }, [islandType, setIsExpanded, setIslandType]);

  // Auto-shrink music if it's been expanded for too long without interaction
  useEffect(() => {
    if (isExpanded && islandType === 'music') {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 8000); 
      return () => clearTimeout(timer);
    }
  }, [isExpanded, islandType, setIsExpanded]);

  if (!isVisible && !islandType) return null;

  const renderContent = () => {
    if (islandType === 'music') {
      return (
        <div className={`flex items-center gap-3 w-full h-full px-4 overflow-hidden transition-all duration-700 ${isExpanded ? 'flex-col justify-center' : 'flex-row'}`}>
          <div className="flex items-center gap-3 w-full">
            <div className={`shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'w-20 h-20 mt-2' : 'w-8 h-8'}`}>
              <img src={musicData.cover || "/api/placeholder/400/400"} alt="Cover" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`font-headline font-black text-white truncate transition-all duration-700 ${isExpanded ? 'text-xl text-center mt-3' : 'text-[10px]'}`}>
                {musicData.title}
              </p>
              <p className={`font-body font-bold text-white/50 truncate transition-all duration-700 ${isExpanded ? 'text-sm text-center' : 'text-[8px]'}`}>
                {musicData.artist}
              </p>
            </div>

            {!isExpanded && (
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-1 h-3 bg-white/70 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1.2s_ease-in-out_infinite]' : ''}`}></div>
                <div className={`w-1 h-4 bg-white rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-1 h-2 bg-white/50 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_0.8s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="w-full mt-5 space-y-5 animate-in fade-in zoom-in-75 duration-700">
               {/* Progress Bar */}
               <div className="w-full px-2">
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-300" style={{ width: `${musicData.progress}%` }}></div>
                 </div>
               </div>

               {/* Controls */}
               <div className="flex items-center justify-center gap-8">
                 <button 
                   onClick={(e) => { e.stopPropagation(); stopMusic(); }} 
                   className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                 >
                   <span className="material-symbols-outlined text-white text-xl">stop</span>
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                   className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-[#0b1326] shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95 hover:scale-105"
                 >
                   <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                     {musicData.isPlaying ? 'pause' : 'play_arrow'}
                   </span>
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} 
                   className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90 text-white"
                 >
                    <span className="material-symbols-outlined text-xl">close_fullscreen</span>
                 </button>
               </div>
            </div>
          )}
        </div>
      );
    }

    if (islandType === 'notification' || islandType === 'reminder') {
       return (
         <div className={`flex items-center gap-3 w-full h-full px-5 transition-all duration-700 ${isExpanded ? 'flex-col justify-center' : 'flex-row'}`} onClick={() => notificationData.action?.()}>
            <div className={`rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${islandType === 'notification' ? 'bg-error text-white' : 'bg-primary text-white'} ${isExpanded ? 'w-16 h-16' : 'w-8 h-8'}`}>
               <span className={`material-symbols-outlined transition-all duration-700 ${isExpanded ? 'text-3xl' : 'text-sm'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{notificationData.icon}</span>
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-700 ${isExpanded ? 'text-center mt-3' : ''}`}>
               <p className={`font-headline font-black text-white truncate leading-tight uppercase tracking-widest transition-all duration-700 ${isExpanded ? 'text-lg' : 'text-[10px]'}`}>{notificationData.title}</p>
               <p className={`font-body font-bold text-white/60 transition-all duration-700 ${isExpanded ? 'text-xs mt-1 block h-auto opacity-100' : 'text-[8px] truncate'}`}>{notificationData.description}</p>
               {isExpanded && (
                 <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest transition-all">
                   Buka Detail
                 </button>
               )}
            </div>
         </div>
       );
    }
    
    return null;
  };

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer group pointer-events-auto
        ${islandType ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        ${isExpanded ? 'w-[calc(100%-32px)] max-w-[420px] h-[220px] rounded-[48px]' : 'w-[180px] h-[44px] rounded-full'}
        bg-[#0b1326]/90 backdrop-blur-2xl border border-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden
      `}
      onClick={() => { if (!isExpanded) setIsExpanded(true); }}
    >
      {renderContent()}
      
      {/* Wave Styles for music bars */}
      <style>{`
        @keyframes music-bar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
      `}</style>
    </div>
  );
};

export default DynamicIsland;
