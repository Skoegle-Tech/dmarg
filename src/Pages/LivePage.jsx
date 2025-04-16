import React, { useState, useEffect, useRef } from "react";
import Layout from "../Layout/Layout";
import { useStore } from "../Store/Store";


const VideoPlayer = () => {


 const {getFilteredVideos} =  useStore()
  // Date formatting helper
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDisplayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const today = formatDate(new Date());

  // States for filtering
  const [filter, setFilter] = useState({
    selectedDevice: "Device-1",
    fromDate: today,
    toDate: today,
    fromTime: "01:00:00",
    toTime: "23:00:00"
  });
  
  const [errors, setErrors] = useState({});
  
  // Video playback states
  const [videoData, setVideoData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);

  // Refs
  const videoRef = useRef(null);
  const nextVideoRef = useRef(null);
  const controlsTimerRef = useRef(null);
  
  const currentVideo = videoData[currentVideoIndex] || null;

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "fromDate" || name === "toDate") {
      setFilter({ ...filter, [name]: formatDate(value) });
    } else {
      setFilter({ ...filter, [name]: value });
    }
  };

  // Validate inputs before fetching videos
  const validateInputs = () => {
    const newErrors = {};
    
    // Validate dates
    const fromDateObj = new Date(filter.fromDate.split("-").reverse().join("-"));
    const toDateObj = new Date(filter.toDate.split("-").reverse().join("-"));
    
    if (fromDateObj > toDateObj) {
      newErrors.date = "From Date cannot be later than To Date.";
    }
    
    // Validate times
    if (filter.fromTime > filter.toTime) {
      newErrors.time = "From Time cannot be later than To Time.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle filter button click
  const handleFilter = () => {
    if (validateInputs()) {
      localStorage.setItem("Device", filter.selectedDevice);
      fetchVideos();
    }
  };

  // Fetch videos from API
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
    const data = await getFilteredVideos(filter);
      
   
      if (data.length === 0) {
        setError("No videos found for the selected criteria.");
        setVideoData([]);
      } else {
        // Sort videos by time
        const sortedData = data.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.fromtime}Z`).getTime();
          const timeB = new Date(`1970-01-01T${b.fromtime}Z`).getTime();
          return timeA - timeB;
        });
        
        setVideoData(sortedData);
        setCurrentVideoIndex(0);
        setIsPlaying(true);
      }
    } catch (err) {
      setError(err.message);
      setVideoData([]);
    } finally {
      setLoading(false);
    }
  };

  // Video control functions
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    
    showControlsTemporarily();
  };

  const handleSliderChange = (e) => {
    const newIndex = Number(e.target.value);
    setCurrentVideoIndex(newIndex);
    setIsPlaying(true);
    showControlsTemporarily();
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < videoData.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setCurrentVideoIndex(0);
    }
    setIsPlaying(true);
  };

  const updateCurrentTime = () => {
    if (!videoRef.current) return;
    
    const time = videoRef.current.currentTime;
    setCurrentTime(formatDisplayTime(time));
  };

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

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  // Effect to load the next video for smooth playback
  useEffect(() => {
    if (videoData.length > 0 && currentVideoIndex < videoData.length - 1) {
      nextVideoRef.current = new Audio(videoData[currentVideoIndex + 1]?.url);
    }
  }, [currentVideoIndex, videoData]);

  // Effect to save device selection to localStorage
  useEffect(() => {
    localStorage.setItem("Device", filter.selectedDevice);
  }, [filter.selectedDevice]);

  // Initial fetch on component load
  useEffect(() => {
    fetchVideos();
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <Layout title="Dmarg - Login">
    <div style={styles.container}>
      <h1 style={styles.title}>Video Surveillance Player</h1>
      
      <div style={styles.mainContent}>
        {/* Video Player Section */}
        <div 
          style={styles.playerContainer} 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {loading ? (
            <div style={styles.loadingContainer}>
              <img src="/retriving.gif" alt="Loading" style={styles.loadingGif} />
              <p style={styles.loadingText}>Loading videos...</p>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{error}</p>
              <button 
                style={styles.retryButton} 
                onClick={handleFilter}
              >
                Retry
              </button>
            </div>
          ) : videoData.length > 0 ? (
            <>
              <div style={styles.videoWrapper}>
                <video
                  ref={videoRef}
                  src={currentVideo?.url}
                  style={styles.video}
                  onEnded={handleVideoEnd}
                  autoPlay
                  onTimeUpdate={updateCurrentTime}
                  preload="auto"
                  onClick={togglePlayPause}
                />
                
                {showControls && (
                  <div style={styles.videoOverlay}>
                    <div style={styles.videoInfo}>
                      {currentVideo && (
                        <span style={styles.videoTitle}>
                          {currentVideo.filename} ({currentVideo.fromtime} - {currentVideo.totime})
                        </span>
                      )}
                    </div>
                    
                    <div style={styles.videoControls}>
                      <button 
                        style={styles.playPauseButton} 
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? "⏸️" : "▶️"}
                      </button>
                      
                      <div style={styles.timeDisplay}>
                        {currentTime}
                      </div>
                      
                      <div style={styles.timeline}>
                        <input
                          type="range"
                          min="0"
                          max={videoData.length - 1}
                          value={currentVideoIndex}
                          onChange={handleSliderChange}
                          style={styles.timelineSlider}
                        />
                        <div style={styles.timelineLabels}>
                          <span>{videoData[0]?.fromtime}</span>
                          <span>{videoData[videoData.length - 1]?.totime}</span>
                        </div>
                      </div>
                      
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
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ ...styles.progressInfo, marginTop: '16px' }}>
              <span>Video: {currentVideoIndex + 1} of {videoData.length}</span>
              </div>

            </>
          ) : (
            <div style={styles.noVideosMessage}>
              <p>No videos found. Please adjust your filter criteria and try again.</p>
            </div>
          )}
        </div>
        
        {/* Filter Controls Section */}
        <div style={styles.filterContainer}>
          <h2 style={styles.filterHeader}>Filters</h2>
          
          {/* Device Selection */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel} htmlFor="deviceSelect">
              Select Device:
            </label>
            <select
              id="deviceSelect"
              name="selectedDevice"
              value={filter.selectedDevice}
              onChange={handleFilterChange}
              style={styles.filterSelect}
            >
              <option value="Device-1">Device 1 - Kochi Car</option>
            </select>
          </div>
          
          {/* Date Range */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>From Date:</label>
            <input
              type="date"
              name="fromDate"
              style={styles.filterInput}
              value={filter.fromDate.split("-").reverse().join("-")}
              onChange={handleFilterChange}
            />
            
            <label style={styles.filterLabel}>To Date:</label>
            <input
              type="date"
              name="toDate"
              style={styles.filterInput}
              value={filter.toDate.split("-").reverse().join("-")}
              onChange={handleFilterChange}
            />
            {errors.date && <p style={styles.errorText}>{errors.date}</p>}
          </div>
          
          {/* Time Range */}
          <div style={styles.filterItem}>
            <label style={styles.filterLabel}>From Time:</label>
            <input
              type="time"
              name="fromTime"
              style={styles.filterInput}
              value={filter.fromTime}
              step="1"
              onChange={handleFilterChange}
            />
            
            <label style={styles.filterLabel}>To Time:</label>
            <input
              type="time"
              name="toTime"
              style={styles.filterInput}
              value={filter.toTime}
              step="1"
              onChange={handleFilterChange}
            />
            {errors.time && <p style={styles.errorText}>{errors.time}</p>}
          </div>
          
          {/* Filter Button */}
          <button 
            style={styles.filterButton} 
            onClick={handleFilter}
            disabled={loading}
          >
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
      </div>
    </div>
    </Layout>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    color: "#333",
    marginBottom: "20px",
    borderBottom: "2px solid #007bff",
    paddingBottom: "10px",
    width: "100%",
    textAlign: "center",
  },
  mainContent: {
    display: "flex",
    flexDirection: "row",
    gap: "30px",
    width: "100%",
    flexWrap: "wrap",
  },
  playerContainer: {
    flex: "2 1 600px",
    position: "relative",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    minHeight: "400px",
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
    padding: "10px",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)",
  },
  videoInfo: {
    padding: "10px",
    color: "#fff",
  },
  videoTitle: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  videoControls: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "10px",
    width: "100%",
  },
  playPauseButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  timeDisplay: {
    color: "#fff",
    fontFamily: "monospace",
    fontSize: "14px",
    minWidth: "80px",
  },
  timeline: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  timelineSlider: {
    width: "100%",
    height: "6px",
    accentColor: "#007bff",
  },
  timelineLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#fff",
    marginTop: "5px",
  },
  volumeControl: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#fff",
  },
  volumeSlider: {
    width: "80px",
    accentColor: "#007bff",
  },
  progressInfo: {
    padding: "10px",
    textAlign: "center",
    color: "#333",
    fontSize: "14px",
  },
  filterContainer: {
    flex: "1 1 300px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  filterHeader: {
    margin: "0 0 20px 0",
    color: "#333",
    fontSize: "20px",
    borderBottom: "1px solid #dee2e6",
    paddingBottom: "10px",
  },
  filterItem: {
    marginBottom: "20px",
  },
  filterLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#333",
    fontWeight: "500",
  },
  filterSelect: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "15px",
    marginBottom: "10px",
  },
  filterInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ced4da",
    fontSize: "15px",
    marginBottom: "10px",
  },
  filterButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    minHeight: "400px",
  },
  loadingGif: {
    maxWidth: "150px",
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "16px",
    color: "#666",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: "20px",
  },
  errorText: {
    color: "#dc3545",
    marginBottom: "15px",
    textAlign: "center",
  },
  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  noVideosMessage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
    padding: "20px",
    textAlign: "center",
    color: "#666",
  },
};

export default VideoPlayer;