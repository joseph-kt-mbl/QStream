import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import useVideoStore from '../store/useVideoStore';

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const VideoPlayer = ({ video }) => {
  const { incrementViews, fetchWatchedTime, saveWatchedTime, watchedTimes } = useVideoStore();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedTime, setWatchedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [viewIncremented, setViewIncremented] = useState(false);
  
  // Refs for debouncing
  const saveTimeoutIdRef = useRef(null);
  const lastSavedTimeRef = useRef(0);

  useEffect(() => {
    fetchWatchedTime(video.id);
    
    // Cleanup function to save time when component unmounts
    return () => {
      if (watchedTime > 0) {
        saveWatchedTime(video.id, watchedTime);
      }
      // Clear any pending timeout
      if (saveTimeoutIdRef.current) {
        clearTimeout(saveTimeoutIdRef.current);
      }
    };
  }, [video.id]);

  useEffect(() => {
    if (videoRef.current && watchedTimes[video.id] !== undefined) {
      videoRef.current.currentTime = watchedTimes[video.id];
    }
  }, [watchedTimes, video.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        setVideoDuration(videoRef.current.duration);
      });
    }
  }, []);

  // Debounced save function
  const debouncedSaveWatchedTime = useCallback((videoId, time) => {
    // Clear any existing timeout
    if (saveTimeoutIdRef.current) {
      clearTimeout(saveTimeoutIdRef.current);
    }
    
    // Only save if time has changed significantly (more than 5 seconds)
    const timeDifference = Math.abs(time - lastSavedTimeRef.current);
    if (timeDifference > 5) {
      saveWatchedTime(videoId, time);
      lastSavedTimeRef.current = time;
      return;
    }
    
    // Set a new timeout to save after delay
    saveTimeoutIdRef.current = setTimeout(() => {
      saveWatchedTime(videoId, time);
      lastSavedTimeRef.current = time;
    }, 3000); // Save after 3 seconds of no updates
  }, [saveWatchedTime]);

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update progress and watched time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const progressPercent = (currentTime / videoRef.current.duration) * 100;
      setProgress(progressPercent);
      setWatchedTime(currentTime);
      
      // Use debounced function instead of direct API call
      debouncedSaveWatchedTime(video.id, currentTime);

      // Increment views if half of the video is watched
      if (!viewIncremented && currentTime >= videoRef.current.duration / 2) {
        incrementViews(video.id);
        setViewIncremented(true);
      }
    }
  };

  // Also save on pause
  const handlePause = () => {
    if (videoRef.current) {
      saveWatchedTime(video.id, videoRef.current.currentTime);
      lastSavedTimeRef.current = videoRef.current.currentTime;
    }
  };

  // Seek video
  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full bg-black">
      <video
        ref={videoRef}
        src={video.filePath}
        className="w-full h-auto"
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onClick={togglePlay}
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom video controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 mb-2 appearance-none bg-gray-500 outline-none"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${progress}%, #6b7280 ${progress}%)`,
          }}
        />

        {/* Control buttons */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="focus:outline-none">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="focus:outline-none">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 appearance-none bg-gray-500"
              />
            </div>

            {/* Timer like YouTube */}
            <span className="text-sm">
              {formatTime(watchedTime)} / {formatTime(videoDuration)}
            </span>
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="focus:outline-none">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;