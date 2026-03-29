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
    isLoading: false
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    description: '',
    icon: 'notifications',
    action: null
  });

  const playerRef = useRef(null);

  const playMusic = (track) => {
    if (!track) return;
    
    // If it's the same song, toggle play/pause
    const isSameSong = musicData.videoId === track.videoId || (track.url && musicData.url === track.url);
    if (isSameSong) {
      setMusicData(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
      return;
    }

    // New song
    setIslandType('music');
    setMusicData({
      ...track,
      isPlaying: true,
      progress: 0,
      isLoading: true
    });
  };

  const togglePlay = () => {
    setMusicData(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const stopMusic = () => {
    setIslandType(null);
    setMusicData(prev => ({ ...prev, isPlaying: false, progress: 0 }));
  };

  const onProgress = (state) => {
    setMusicData(prev => ({ ...prev, progress: state.played * 100 }));
  };

  const onBuffer = () => setMusicData(prev => ({ ...prev, isLoading: true }));
  const onBufferEnd = () => setMusicData(prev => ({ ...prev, isLoading: false }));
  const onReady = () => setMusicData(prev => ({ ...prev, isLoading: false }));
  
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
      
      {/* HIDDEN YOUTUBE PLAYER (OFFICIAL STABILITY) */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {musicData.videoId && (
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${musicData.videoId}`}
            playing={musicData.isPlaying}
            onProgress={onProgress}
            onBuffer={onBuffer}
            onBufferEnd={onBufferEnd}
            onReady={onReady}
            onEnded={onEnded}
            width="0"
            height="0"
            config={{
              youtube: {
                playerVars: { autoplay: 1, controls: 0, showinfo: 0, rel: 0 }
              }
            }}
          />
        )}
      </div>
    </DynamicIslandContext.Provider>
  );
};
