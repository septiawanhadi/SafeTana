import React, { createContext, useContext, useState, useRef } from 'react';

const DynamicIslandContext = createContext();

export const useDynamicIsland = () => useContext(DynamicIslandContext);

export const DynamicIslandProvider = ({ children }) => {
  const [islandType, setIslandType] = useState(null); // null, 'music', 'notification', 'reminder'
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicData, setMusicData] = useState({
    title: '',
    artist: '',
    cover: '',
    url: '',
    videoId: '',
    isPlaying: false,
    progress: 0,
    isLoading: false,
    isReady: true
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    description: '',
    icon: 'notifications',
    action: null
  });

  const isTogglingRef = useRef(false);

  const playMusic = (track) => {
    if (!track) return;
    
    // If it's the same song, toggle play/pause
    const isSameSong = musicData.videoId === track.videoId || (track.url && musicData.url === track.url);
    if (isSameSong) {
      togglePlay();
      return;
    }

    // New song
    setIslandType('music');
    setMusicData({
      ...track,
      isPlaying: true,
      progress: 0,
      isLoading: false,
      isReady: true
    });
  };

  const togglePlay = () => {
    if (isTogglingRef.current) return;
    
    isTogglingRef.current = true;
    setMusicData(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    
    // 500ms debounce to allow browser to manage the IFrame lifecycle
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 500);
  };

  const stopMusic = () => {
    setIslandType(null);
    setMusicData(prev => ({ ...prev, isPlaying: false, progress: 0 }));
  };

  const showNotification = (data) => {
    setNotificationData(data);
    setIslandType('notification');
  };

  const showReminder = (data) => {
    setNotificationData(data);
    setIslandType('reminder');
  };

  return (
    <DynamicIslandContext.Provider value={{
      islandType, setIslandType,
      isExpanded, setIsExpanded,
      musicData, playMusic, togglePlay, stopMusic,
      notificationData, showNotification, showReminder
    }}>
      {children}
      
      {/* 
        NATIVE YOUTUBE BRIDGE (UNSTOPPABLE STABILITY)
        Replacing library-heavy ReactPlayer with a standard embed.
        Size 60x60px + 5% opacity ensures it's 'visible' to Chrome/Vercel policies.
      */}
      <div style={{ 
        position: 'fixed', 
        bottom: '12px', 
        right: '12px', 
        width: '60px', 
        height: '60px', 
        overflow: 'hidden', 
        pointerEvents: 'none', 
        opacity: 0.05, 
        zIndex: 99999,
        background: '#000',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        {musicData.isPlaying && musicData.videoId && (
          <iframe
            key={musicData.videoId}
            width="60"
            height="60"
            src={`https://www.youtube.com/embed/${musicData.videoId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title="SafeTana Playback Engine"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </div>
    </DynamicIslandContext.Provider>
  );
};
