import React, { useEffect, useState } from 'react';
import { useDynamicIsland } from '../../contexts/DynamicIslandContext';

const DynamicIsland = () => {
  const { 
    islandType, 
    activeActivities, removeActivity,
    isExpanded, setIsExpanded,
    isFutureMode,
    musicData, togglePlay, seekTo, findAlternativePlayback,
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
    if (activeActivities.length > 0) {
      setTimeout(() => setIsVisible(true), 0);
      const primary = activeActivities[0];
      
      // Auto-expand slightly on notification/reminder
      if (primary.type !== 'music') {
        setTimeout(() => setIsExpanded(true), 200);
        const timer = setTimeout(() => {
          setIsExpanded(false);
          setTimeout(() => {
            removeActivity(primary.id);
          }, 500);
        }, 6000);
        return () => clearTimeout(timer);
      }
    } else {
      setTimeout(() => setIsVisible(false), 500); 
    }
  }, [activeActivities.length, setIsExpanded, removeActivity]);

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

  const renderActivity = (activity, isPrimary = true, mode = 'compact') => {
    // Safety check to prevent "Cannot read properties of undefined (reading 'type')"
    if (!activity) return null;
    
    const type = activity.type;

    if (type === 'music') {
      if (mode === 'expanded') {
        return (
          <div className="flex flex-col w-full h-full p-6 justify-between animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between w-full">
              <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <img src={musicData.cover || "/api/placeholder/400/400"} alt="Cover" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 ml-4">
                <p className="font-headline font-black text-white text-lg truncate tracking-tight">{musicData.title}</p>
                <p className="font-body font-bold text-white/50 text-[10px] truncate uppercase tracking-[0.1em]">{musicData.artist}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <div className={`w-1 h-3 bg-white/40 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1.2s_ease-in-out_infinite]' : ''}`}></div>
                <div className={`w-1 h-4 bg-white/80 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.2s' }}></div>
                <div className={`w-1 h-2 bg-white/30 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_0.8s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            <div className="w-full space-y-1 mt-4">
               <div className="w-full py-2 cursor-pointer group/progress" onClick={handleSeek}>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden transition-all group-hover/progress:h-2">
                   <div className="h-full bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ width: `${musicData.progress}%` }}></div>
                 </div>
               </div>
               <div className="flex justify-between items-center text-[9px] font-mono font-bold text-white/30 tracking-widest">
                 <span>{formatTime(musicData.currentTime)}</span>
                 <span>-{formatTime(musicData.duration - musicData.currentTime)}</span>
               </div>
            </div>

            <div className="flex items-center justify-center gap-10 mt-2">
               <button onClick={(e) => { e.stopPropagation(); findAlternativePlayback(); }} className="w-10 h-10 flex items-center justify-center rounded-full text-white/40 hover:text-indigo-400 active:scale-90"><span className="material-symbols-outlined text-2xl">sync</span></button>
               <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black shadow-xl active:scale-95"><span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{musicData.isPlaying ? 'pause' : 'play_arrow'}</span></button>
               <button onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }} className="w-10 h-10 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 active:scale-90"><span className="material-symbols-outlined text-2xl">skip_next</span></button>
            </div>
          </div>
        );
      }

      return (
        <div className={`flex items-center w-full h-full ${isPrimary ? 'px-4' : 'justify-center'}`}>
          <div className={`shrink-0 rounded-lg overflow-hidden transition-all duration-500 ${isPrimary ? 'w-6 h-6' : 'w-5 h-5'}`}>
            <img src={musicData.cover || "/api/placeholder/100/100"} alt="Art" className="w-full h-full object-cover" />
          </div>
          {isPrimary && (
            <div className="flex-1 min-w-0 ml-2">
               <div className="flex items-center gap-1">
                 <div className={`w-0.5 h-2 bg-white/60 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_1s_ease-in-out_infinite]' : ''}`}></div>
                 <div className={`w-0.5 h-3 bg-white/90 rounded-full ${musicData.isPlaying ? 'animate-[music-bar_0.8s_ease-in-out_infinite]' : ''}`} style={{ animationDelay: '0.2s' }}></div>
               </div>
            </div>
          )}
        </div>
      );
    }

    if (type === 'notification' || type === 'reminder') {
      if (mode === 'expanded') {
        return (
          <div className="flex flex-col items-center justify-center w-full h-full px-6 animate-in fade-in zoom-in-95 duration-500">
             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-2xl ${type === 'notification' ? 'bg-error text-white' : 'bg-primary text-white'}`}>
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{notificationData.icon}</span>
             </div>
             <p className="font-headline font-black text-white text-xl mb-2 text-center uppercase tracking-widest">{notificationData.title}</p>
             <p className="font-body font-bold text-white/50 text-sm text-center max-w-xs">{notificationData.description}</p>
             <button 
               onClick={(e) => { e.stopPropagation(); notificationData.action?.(); setIsExpanded(false); }}
               className="mt-6 px-10 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
             >
               Lanjutkan
             </button>
          </div>
        );
      }

      return (
        <div className={`flex items-center justify-center w-full h-full ${isPrimary ? 'px-4' : ''}`}>
           <span className={`material-symbols-outlined ${isPrimary ? 'text-xl' : 'text-sm'} text-white`}>{notificationData.icon}</span>
           {isPrimary && <span className="ml-2 text-[10px] font-black text-white/80 uppercase tracking-tighter truncate">{notificationData.title}</span>}
        </div>
      );
    }

    return null;
  };

  const isSplit = activeActivities.length > 1 && !isExpanded;
  const primaryActivity = activeActivities[0];
  const secondaryActivity = activeActivities[1];

  // Dynamic Island Dimensions (Physical Units mapping)
  // Current: ~126px wide (20.7mm)
  // Future: ~82px wide (13.5mm)
  const baseWidth = isFutureMode ? 'w-[82px]' : 'w-[126px]';
  const expandedWidth = 'w-[calc(100%-32px)] max-w-[380px]';
  const splitWidth = 'w-[180px]'; // Slightly wider for split

  return (
    <div 
      id="dynamic-island"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer pointer-events-auto
        ${islandType || activeActivities.length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        ${isExpanded ? `${expandedWidth} h-[240px] rounded-[3rem]` : isSplit ? `${splitWidth} h-[38px] rounded-full` : `${baseWidth} h-[36px] rounded-full`}
        bg-black backdrop-blur-3xl border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center
      `}
      onClick={() => { if (!isExpanded) setIsExpanded(true); }}
    >
      {isExpanded ? (
        renderActivity(primaryActivity, true, 'expanded')
      ) : isSplit ? (
        <div className="flex items-center justify-between w-full px-1.5">
           <div className="flex-1 h-full flex items-center justify-center bg-white/5 rounded-full mr-1">
              {renderActivity(primaryActivity, true, 'compact')}
           </div>
           <div className="w-[32px] h-[32px] bg-white/5 rounded-full flex items-center justify-center">
              {renderActivity(secondaryActivity, false, 'compact')}
           </div>
        </div>
      ) : primaryActivity ? (
        renderActivity(primaryActivity, true, 'compact')
      ) : null}
      
      <style>{`
        @keyframes music-bar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.4); }
        }
        #dynamic-island {
           box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
};

export default DynamicIsland;
