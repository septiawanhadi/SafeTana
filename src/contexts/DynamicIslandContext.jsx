import React, { createContext, useContext, useState, useRef } from 'react';
import ReactPlayer from 'react-player';

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
    isReady: false
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    description: '',
    icon: 'notifications',
    action: null
  });

  const playerRef = useRef(null);
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
      isLoading: true,
      isReady: false
    });
  };

  const togglePlay = () => {
    // Zero-Friction: Remove isReady lock to allow immediate re-triggering
    if (isTogglingRef.current) return;
    
    isTogglingRef.current = true;
    setMusicData(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    
    // 500ms debounce to allow the YouTube play/pause promise to settle
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 500);
  };

  const stopMusic = () => {
    setIslandType(null);
    setMusicData(prev => ({ ...prev, isPlaying: false, progress: 0 }));
  };

  const onProgress = (state) => {
    setMusicData(prev => ({ ...prev, progress: state.played * 100 }));
  };

  const onReady = () => setMusicData(prev => ({ ...prev, isReady: true, isLoading: false }));
  
  const onEnded = () => {
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
        VISIBLE-HIDDEN PLAYER (BROWSER COMPLIANCE)
        Modern browsers (Chrome/Vercel) block audio for iframes < 30px or hidden.
        40x40px at 0.01 opacity makes the browser treat it as a valid, audible element.
      */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        width: '40px', 
        height: '40px', 
        overflow: 'hidden', 
        pointerEvents: 'none', 
        opacity: 0.01, 
        zIndex: 9999,
        background: 'black',
        borderRadius: '50%'
      }}>
        {musicData.videoId && (
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${musicData.videoId}`}
            playing={musicData.isPlaying}
            onProgress={onProgress}
            onReady={onReady}
            onEnded={onEnded}
            width="40px"
            height="40px"
            config={{
              youtube: {
                playerVars: { autoplay: 1, controls: 0, showinfo: 0, rel: 0, modestbranding: 1 }
              }
            }}
          />
        )}
      </div>
    </DynamicIslandContext.Provider>
  );
};
