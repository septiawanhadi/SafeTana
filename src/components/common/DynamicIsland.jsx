import React, { useEffect, useState } from 'react';
import { useDynamicIsland } from '../../contexts/DynamicIslandContext';

const DynamicIsland = () => {
  const { 
    islandType, setIslandType, 
    isExpanded, setIsExpanded,
    musicData, togglePlay, stopMusic, seekTo, findAlternativePlayback,
    notificationData 
  } = useDynamicIsland();

  const [isVisible, setIsVisible] = useState(false);

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(x / rect.width, 1));
    const targetSeconds = Math.floor(percent * 210); // Assume 3:30 (210s) duration
    seekTo(targetSeconds);
  };

  useEffect(() => {
    if (islandType) {
      setIsVisible(true);
      // Auto-expand slightly on notification/reminder
      if (islandType !== 'music') {
        setTimeout(() => setIsExpanded(true), 200);
        // Auto-shrink and hide or revert to music after 6 seconds
        const timer = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(() => {
            // Revert logic: If music is playing, back to music. Else hide.
            setIslandType(musicData.isPlaying ? 'music' : null);
          }, 500);
        }, 6000);
        return () => clearTimeout(timer);
      }
    } else {
      setTimeout(() => setIsVisible(false), 500); 
    }
  }, [islandType, setIsExpanded, setIslandType, musicData.isPlaying]);

  // Auto-shrink music if it's been expanded for too long
  useEffect(() => {
    if (isExpanded && islandType === 'music') {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 8000); 
      return () => clearTimeout(timer);
    }
  }, [isExpanded, islandType, setIsExpanded]);

  if (!isVisible && !islandType) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (islandType === 'music') {
      return (
        <div className={`flex flex-col w-full h-full transition-all duration-700 ${isExpanded ? 'p-6 justify-between' : 'px-4 items-center justify-center'}`}>
          {/* Top Row: Artist/Title/Art & Waves */}
          <div className={`flex items-center gap-4 w-full ${isExpanded ? 'justify-between' : ''}`}>
            <div className={`shrink-0 rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'w-16 h-16' : 'w-8 h-8'}`}>
              <img 
                src={musicData.cover || "/api/placeholder/400/400"} 
                alt="Cover" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = "/api/placeholder/400/400"; }}
              />
            </div>
            
            <div className={`flex-1 min-w-0 transition-all duration-700 ${isExpanded ? 'ml-0' : 'ml-1'}`}>
              <p className={`font-headline font-black text-white truncate tracking-tight transition-all duration-700 ${isExpanded ? 'text-lg mb-0.5' : 'text-[10px]'}`}>
                {musicData.title}
              </p>
              <p className={`font-body font-bold text-white/50 truncate uppercase tracking-[0.1em] transition-all duration-700 ${isExpanded ? 'text-[10px]' : 'text-[7px]'}`}>
                {musicData.artist}
              </p>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <div className={`w-1 h-3 bg-white/40 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1.2s_ease-in-out_infinite]' : ''}`}></div>
              <div className={`w-1 h-4 bg-white/80 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.2s' }}></div>
              <div className={`w-1 h-2 bg-white/30 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_0.8s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {isExpanded && (
            <>
               {/* Middle: Progress Bar & Timers */}
               <div className="w-full space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
                 <div className="w-full py-2 cursor-pointer group/progress" onClick={handleSeek}>
                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden transition-all group-hover/progress:h-2">
                     <div className="h-full bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ width: `${musicData.progress}%` }}></div>
                   </div>
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-mono font-bold text-white/30 tracking-widest px-1">
                   <span>{formatTime(musicData.currentTime)}</span>
                   <span>-03:01</span>
                 </div>
               </div>

               {/* Bottom: Playback Controls (Centered as iPhone) */}
               <div className="flex items-center justify-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <button 
                   onClick={(e) => { e.stopPropagation(); findAlternativePlayback(); }} 
                   className="w-10 h-10 flex items-center justify-center rounded-full text-white/40 hover:text-indigo-400 transition-all active:scale-90 group"
                   title="Bukan lagu ini? Cari versi lain"
                 >
                   <span className="material-symbols-outlined text-2xl group-hover:rotate-180 transition-transform duration-500">sync</span>
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                   className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black shadow-xl transition-all active:scale-95 hover:scale-105"
                 >
                   <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                     {musicData.isPlaying ? 'pause' : 'play_arrow'}
                   </span>
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} 
                   className="w-10 h-10 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-all active:scale-90"
                 >
                    <span className="material-symbols-outlined text-2xl">skip_next</span>
                 </button>
               </div>
            </>
          )}
        </div>
      );
    }

    if (islandType === 'notification' || islandType === 'reminder') {
       return (
         <div className={`flex items-center gap-4 w-full h-full px-6 transition-all duration-700 ${isExpanded ? 'flex-col justify-center' : 'flex-row'}`} onClick={() => { if(!isExpanded) setIsExpanded(true); }}>
            <div className={`rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${islandType === 'notification' ? 'bg-error text-white' : 'bg-primary text-white'} ${isExpanded ? 'w-20 h-20 mb-2' : 'w-9 h-9'}`}>
               <span className={`material-symbols-outlined transition-all duration-700 ${isExpanded ? 'text-4xl' : 'text-base'}`} style={{ fontVariationSettings: "'FILL' 1" }}>{notificationData.icon}</span>
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-700 ${isExpanded ? 'text-center' : ''}`}>
               <p className={`font-headline font-black text-white truncate leading-tight uppercase tracking-[0.2em] transition-all duration-700 ${isExpanded ? 'text-xl mb-2' : 'text-[11px]'}`}>{notificationData.title}</p>
               <p className={`font-body font-bold text-white/50 transition-all duration-700 ${isExpanded ? 'text-sm block h-auto opacity-100 max-w-xs mx-auto leading-relaxed' : 'text-[9px] truncate'}`}>{notificationData.description}</p>
               {isExpanded && (
                 <button 
                  onClick={(e) => { e.stopPropagation(); notificationData.action?.(); setIsExpanded(false); }}
                  className="mt-6 px-10 py-3 bg-white text-black hover:bg-white/90 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl"
                 >
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
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer group pointer-events-auto
        ${islandType ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        ${isExpanded ? 'w-[calc(100%-32px)] max-w-[360px] h-[240px] rounded-[3.5rem]' : 'w-[124px] h-[52px] rounded-full'}
        bg-black backdrop-blur-3xl border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden
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
