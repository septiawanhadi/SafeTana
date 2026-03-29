import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

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
    id: '', 
    isPlaying: false,
    progress: 0
  });

  const [notificationData, setNotificationData] = useState({
    title: '',
    description: '',
    icon: 'notifications',
    action: null
  });

  const audioRef = useRef(new Audio());

  // Handle Audio Playback
  useEffect(() => {
    const audio = audioRef.current;
    audio.crossOrigin = "anonymous"; // Essential for CORS bypass on some proxies
    
    const updateProgress = () => {
      if (audio.duration) {
        setMusicData(prev => ({ ...prev, progress: (audio.currentTime / audio.duration) * 100 }));
      }
    };

    const handleEnded = () => {
      setMusicData(prev => ({ ...prev, isPlaying: false, progress: 0 }));
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const PIPED_API = '/piped-api';

  const fetchStreamUrl = async (videoId) => {
    try {
      const res = await fetch(`${PIPED_API}/streams/${videoId}`);
      if (!res.ok) throw new Error("Proxy error");
      const data = await res.json();
      // Prefer M4A/AAC audio-only streams
      const audioStream = data.audioStreams.find(s => s.format === 'M4A' || s.format === 'AAC') 
                       || data.audioStreams[0];
      if (audioStream?.url) return audioStream.url;
    } catch (err) {
      console.warn(`Piped proxy failed for video ${videoId}:`, err);
    }
    return null;
  };

  const playMusic = async (track) => {
    const audio = audioRef.current;
    
    // If it's the same URL or videoId and it's already loaded
    if ((track.url && musicData.url === track.url) || (track.videoId && musicData.videoId === track.videoId)) {
      if (musicData.isPlaying) {
        audio.pause();
        setMusicData(prev => ({ ...prev, isPlaying: false }));
      } else {
        audio.play().catch(e => console.error("Play failed", e));
        setMusicData(prev => ({ ...prev, isPlaying: true }));
      }
      return;
    }

    // Stop and Reset
    audio.pause();
    setMusicData(prev => ({ ...prev, isPlaying: false, isLoading: true }));
    setIslandType('music');

    let streamUrl = track.url;

    // On-demand fetch for YouTube tracks
    if (track.videoId && !streamUrl) {
      streamUrl = await fetchStreamUrl(track.videoId);
      if (!streamUrl) {
        console.error("Critical Failure: Could not fetch stream URL from proxy.");
        setMusicData(prev => ({ ...prev, isLoading: false }));
        return;
      }
    }

    audio.src = streamUrl;
    audio.load();
    audio.play().then(() => {
      setMusicData({
        ...track,
        url: streamUrl,
        isPlaying: true,
        progress: 0,
        isLoading: false
      });
    }).catch(err => {
      console.error("Playback failed:", err);
      setMusicData(prev => ({ ...prev, isLoading: false }));
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (musicData.isPlaying) {
      audio.pause();
      setMusicData(prev => ({ ...prev, isPlaying: false }));
    } else {
      audio.play();
      setMusicData(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const stopMusic = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
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
    </DynamicIslandContext.Provider>
  );
};
