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
    audioUrl: '', // Direct stream URL (v8.0)
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 210, // Default 3:30
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
  const iframeRef = useRef(null);
  const audioRef = useRef(null);

  const lastTimeRef = useRef(0);
  const stuckCountRef = useRef(0);

  // Sync Audio Playback (v9.0)
  React.useEffect(() => {
    if (!audioRef.current || !musicData.audioUrl) return;
    
    if (musicData.isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn("Audio play failed, falling back to IFrame", e);
        handleAudioError();
      });
    } else {
      audioRef.current.pause();
    }
  }, [musicData.isPlaying, musicData.audioUrl]);

  // Stuck Detection & Timer (v9.0 Self-Healing)
  React.useEffect(() => {
    let interval = null;
    if (musicData.isPlaying) {
      interval = setInterval(() => {
        // IFrame Fallback Timer
        if (!musicData.audioUrl) {
          setMusicData(prev => ({ 
            ...prev, 
            currentTime: prev.currentTime + 1,
            progress: Math.min(((prev.currentTime + 1) / prev.duration) * 100, 100)
          }));
        }

        // Stuck Detection (No progress for 6s)
        if (Math.abs(musicData.currentTime - lastTimeRef.current) < 0.1) {
          stuckCountRef.current += 1;
          if (stuckCountRef.current > 6) {
             console.warn("Playback stuck, finding alternative source...");
             findAlternativePlayback();
             stuckCountRef.current = 0;
          }
        } else {
          stuckCountRef.current = 0;
        }
        lastTimeRef.current = musicData.currentTime;
      }, 1000);
    } else {
      clearInterval(interval);
      stuckCountRef.current = 0;
    }
    return () => clearInterval(interval);
  }, [musicData.isPlaying, musicData.audioUrl, musicData.duration, musicData.currentTime]);

  const handleAudioError = () => {
    console.warn("Direct stream failed, switching to IFrame mode...");
    setMusicData(prev => ({ ...prev, audioUrl: '' }));
  };

  const seekTo = (seconds) => {
    setMusicData(prev => ({ 
      ...prev, 
      currentTime: seconds,
      progress: Math.min((seconds / prev.duration) * 100, 100)
    }));

    if (musicData.audioUrl && audioRef.current) {
      audioRef.current.currentTime = seconds;
    } else if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }), 
          '*'
        );
      } catch (e) {
        console.warn("Seek postMessage failed", e);
      }
    }
  };

  const playMusic = (track) => {
    if (!track) return;
    
    // If it's the same song, toggle play/pause
    const isSameSong = (track.videoId && musicData.videoId === track.videoId) || 
                       (track.audioUrl && musicData.audioUrl === track.audioUrl);

    if (isSameSong && musicData.isPlaying) {
      togglePlay();
      return;
    }

    // New song
    setIslandType('music');
    setMusicData({
      ...track,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      duration: track.duration || 210,
      isLoading: false,
      isReady: true
    });
  };

  const togglePlay = () => {
    if (isTogglingRef.current) return;
    isTogglingRef.current = true;
    setMusicData(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    setTimeout(() => { isTogglingRef.current = false; }, 500);
  };

  const stopMusic = () => {
    setIslandType(null);
    setMusicData(prev => ({ ...prev, isPlaying: false, progress: 0, audioUrl: '', videoId: '' }));
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || musicData.duration;
      setMusicData(prev => ({ 
        ...prev, 
        currentTime: cur,
        progress: (cur / dur) * 100,
        duration: dur
      }));
    }
  };

  const findAlternativePlayback = () => {
    // This will be implemented by components (like MoodTracker) 
    // to search for different versions of the same song.
    // For now, it's a bridge to trigger a search re-run.
    if (musicData.title) {
       // Logic to trigger a search in MoodTracker if it's open
       window.dispatchEvent(new CustomEvent('safetana:find-alternative', { 
         detail: { title: musicData.title, artist: musicData.artist } 
       }));
    }
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
      musicData, playMusic, togglePlay, stopMusic, seekTo,
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
        {/* Native Audio (Priority Stream) */}
        {musicData.audioUrl && (
          <audio 
            ref={audioRef}
            src={musicData.audioUrl}
            onTimeUpdate={handleAudioTimeUpdate}
            onEnded={stopMusic}
            onError={handleAudioError}
            autoPlay
          />
        )}

        {/* IFrame Fallback */}
        {!musicData.audioUrl && musicData.isPlaying && musicData.videoId && (
          <iframe
            ref={iframeRef}
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
