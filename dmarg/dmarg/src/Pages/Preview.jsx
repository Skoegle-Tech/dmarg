import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const LiveVideoPlayer = () => {
  // State management
  const [isLive, setIsLive] = useState(false);
  const [videoData, setVideoData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState("Device-1");
  const [liveStatus, setLiveStatus] = useState("Checking live status...");
  const [isMobile, setIsMobile] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const fetchIntervalRef = useRef(null);
  const statusCheckIntervalRef = useRef(null);

  // Date & time handling
  const formattedDate = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const fromTime = "01:00:00"; // Start of the day
  const toTime = "23:59:59"; // End of the day
  
  // Get current time and time 2 minutes ago
  const getCurrentTimeInfo = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8);
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const twoMinutesAgoTime = twoMinutesAgo.toTimeString().slice(0, 8);
    return { currentTime, twoMinutesAgoTime };
  };

  // Check for mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Function to check if the device is live
  const checkDeviceLiveStatus = async () => {
    setLiveStatus("Checking live status...");
    const { currentTime, twoMinutesAgoTime } = getCurrentTimeInfo();
    
    try {
      const response = await axios.get(
        `https://api.skoegle.com/api/dmarg/checklive?fromdate=${formattedDate}&todate=${formattedDate}&fromtime=${twoMinutesAgoTime}&totime=${currentTime}&deviceName=${selectedDevice}`
      );
      
      if (response.data.isLive) {
        setIsLive(true);
        setLiveStatus("Device is live");
        fetchVideos(); // Fetch initial videos if live
      } else {
        setIsLive(false);
        setLiveStatus("Device is offline");
        setError("Device is not currently transmitting live data.");
      }
    } catch (err) {
      setIsLive(false);
      setError(`Error checking live status: ${err.message}`);
      setLiveStatus("Connection error");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch video data
  const fetchVideos = async () => {
    const { currentTime } = getCurrentTimeInfo();
    
    try {
      const response = await axios.get(
        `https://production-server-tygz.onrender.com/api/dmarg/filtervidios?fromdate=${formattedDate}&todate=${formattedDate}&fromtime=${fromTime}&totime=${currentTime}&deviceName=${selectedDevice}`
      );

      if (response.data && response.data.length > 0) {
        const sortedData = response.data.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.fromtime}Z`).getTime();
          const timeB = new Date(`1970-01-01T${b.fromtime}Z`).getTime();
          return timeA - timeB;
        });
        
        setVideoData(sortedData);
        
        // Set to the most recent video (last in the sorted array)
        const newIndex = sortedData.length - 1;
        setCurrentVideoIndex(newIndex);
        
        // Clear any previous errors
        setError(null);
      } else {
        setError("No videos found for today.");
        setVideoData([]);
      }
    } catch (err) {
      setError(`Error fetching videos: ${err.message}`);
    }
  };

  // Function to handle video end event
  const handleVideoEnd = () => {
    if (currentVideoIndex < videoData.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      // If we've reached the end, refresh videos to see if new ones are available
      fetchVideos();
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current || videoData.length === 0) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    
    showControlsTemporarily();
  };

  // Show controls temporarily
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Handle mouse movement to show controls
  const handleMouseMove = () => {
    showControlsTemporarily();
  };
  
  // Handle touch event to show controls
  const handleTouch = () => {
    showControlsTemporarily();
  };
  
  // Handle device selection change
  const handleDeviceChange = (e) => {
    const newDevice = e.target.value;
    setSelectedDevice(newDevice);
    setLoading(true);
    setIsLive(false);
    setVideoData([]);
    setCurrentVideoIndex(0);
    
    // Reset status and check the new device
    checkDeviceLiveStatus();
  };

  // Start monitoring when device selection changes
  useEffect(() => {
    checkDeviceLiveStatus();
    
    // Clear any existing intervals
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current);
    }
    
    // Set up new intervals
    statusCheckIntervalRef.current = setInterval(() => {
      checkDeviceLiveStatus();
    }, 60000); // Check live status every minute
    
    fetchIntervalRef.current = setInterval(() => {
      if (isLive) {
        fetchVideos();
      }
    }, 20000); // Refresh videos every 20 seconds if live
    
    // Save selected device to localStorage
    localStorage.setItem("Device", selectedDevice);
    
    return () => {
      // Cleanup
      if (statusCheckIntervalRef.current) clearInterval(statusCheckIntervalRef.current);
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [selectedDevice]);

  // Update video when data or index changes
  useEffect(() => {
    if (videoData.length > 0 && currentVideoIndex >= 0 && currentVideoIndex < videoData.length) {
      const currentVideo = videoData[currentVideoIndex];
      
      if (videoRef.current && currentVideo) {
        videoRef.current.src = currentVideo.url;
        
        if (isLive) {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Error playing video:", err));
        }
      }
    }
  }, [videoData, currentVideoIndex]);

  // Refresh videos when live status changes
  useEffect(() => {
    if (isLive) {
      fetchVideos();
    }
  }, [isLive]);
  
  // Render loading state
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <img src="/Loading.gif" alt="Loading" style={styles.loadingImage} />
        <p style={styles.loadingText}>Connecting to device...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={isMobile ? styles.headerMobile : styles.header}>
        <div style={styles.titleContainer}>
          <h2 style={isMobile ? styles.titleMobile : styles.title}>Live Surveillance</h2>
          <div 
            style={{
              ...styles.statusIndicator,
              backgroundColor: isLive ? "#4CAF50" : "#f44336"
            }}
          />
          <span style={styles.statusText}>{liveStatus}</span>
        </div>
        
        <div style={isMobile ? styles.deviceSelectorMobile : styles.deviceSelector}>
          <label style={styles.label} htmlFor="deviceSelect">
            Select Device:
          </label>
          <select
            id="deviceSelect"
            value={selectedDevice}
            onChange={handleDeviceChange}
            style={isMobile ? styles.selectMobile : styles.select}
          >
            <option value="Device-1">Device 1 - Kochi Car</option>
          </select>
        </div>
      </div>

      <div style={styles.contentContainer}>
        {isLive ? (
          <div 
            style={styles.videoWrapper}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouch}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              style={styles.video}
              onEnded={handleVideoEnd}
              preload="auto"
              playsInline
              onClick={togglePlayPause}
            />
            
            {showControls && (
              <div style={isMobile ? styles.videoOverlayMobile : styles.videoOverlay}>
                <div style={styles.videoInfo}>
                  {videoData[currentVideoIndex] && (
                    <span style={isMobile ? styles.videoTitleMobile : styles.videoTitle}>
                      {videoData[currentVideoIndex].filename}
                    </span>
                  )}
                </div>
                
                <div style={isMobile ? styles.videoControlsMobile : styles.videoControls}>
                  <button 
                    style={isMobile ? styles.playPauseButtonMobile : styles.playPauseButton} 
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "⏸️" : "▶️"}
                  </button>
                  
                  {!isMobile && (
                    <div style={styles.volumeControl}>
                      <span>{volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        style={styles.volumeSlider}
                      />
                    </div>
                  )}
                  
                  <div style={styles.liveIndicator}>
                    <span style={styles.liveBadge}>LIVE</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.offlineContainer}>
            <img 
              src="/notlive.gif" 
              alt="Not Live" 
              style={isMobile ? styles.offlineImageMobile : styles.offlineImage}
            />
            <p style={styles.offlineText}>{error}</p>
            <button 
              style={isMobile ? styles.retryButtonMobile : styles.retryButton}
              onClick={checkDeviceLiveStatus}
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
      
      {isLive && videoData.length > 0 && (
        <div style={styles.infoContainer}>
          <p style={styles.infoText}>
            Streaming live footage from {selectedDevice}. 
            {videoData.length > 0 && ` Currently showing video #${currentVideoIndex + 1} of ${videoData.length}.`}
          </p>
        </div>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "100%",
    margin: "0 auto",
    padding: "10px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    padding: "0 10px",
    flexWrap: "wrap",
  },
  headerMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: "15px",
    padding: "0 5px",
    gap: "10px",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  title: {
    margin: "0",
    color: "#333",
    fontSize: "24px",
  },
  titleMobile: {
    margin: "0",
    color: "#333",
    fontSize: "20px",
  },
  statusIndicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginLeft: "10px",
  },
  statusText: {
    fontSize: "14px",
    color: "#666",
  },
  deviceSelector: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  deviceSelectorMobile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "5px",
    width: "100%",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  select: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  selectMobile: {
    padding: "10px 12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  contentContainer: {
    width: "100%",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "15px",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)",
  },
  videoOverlayMobile: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)",
  },
  videoInfo: {
    color: "#fff",
    fontWeight: "bold",
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
  },
  videoTitle: {
    fontSize: "16px",
  },
  videoTitleMobile: {
    fontSize: "14px",
  },
  videoControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  videoControlsMobile: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "0 5px",
  },
  playPauseButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  playPauseButtonMobile: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "28px",
    cursor: "pointer",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    touchAction: "manipulation",
  },
  volumeControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#fff",
  },
  volumeSlider: {
    width: "80px",
    accentColor: "#007bff",
  },
  liveIndicator: {
    marginLeft: "auto",
  },
  liveBadge: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    animation: "pulse 1.5s infinite",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "400px",
    width: "100%",
  },
  loadingImage: {
    maxWidth: "150px",
  },
  loadingText: {
    margin: "20px 0 0",
    color: "#666",
    fontSize: "16px",
    textAlign: "center",
  },
  offlineContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    minHeight: "300px",
  },
  offlineImage: {
    maxWidth: "200px",
    marginBottom: "20px",
  },
  offlineImageMobile: {
    maxWidth: "150px",
    marginBottom: "20px",
  },
  offlineText: {
    color: "#666",
    textAlign: "center",
    fontSize: "16px",
    marginBottom: "20px",
  },
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s",
  },
  retryButtonMobile: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "18px",
    transition: "background-color 0.2s",
    width: "80%",
    maxWidth: "300px",
  },
  infoContainer: {
    margin: "15px 0",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    border: "1px solid #eee",
  },
  infoText: {
    color: "#666",
    fontSize: "14px",
    margin: 0,
    textAlign: "center",
  },
  "@keyframes pulse": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0.6 },
    "100%": { opacity: 1 }
  },
};

export default LiveVideoPlayer;