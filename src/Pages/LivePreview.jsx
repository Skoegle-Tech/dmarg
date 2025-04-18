import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { useStore } from "../Store/Store";
import { useNavigate } from 'react-router-dom';

// Material UI imports
import {
  Box,
  Typography,
  Button,
  IconButton,
  Slider,
  Paper,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Fade,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  VolumeDown,
  ChevronLeft,
  ChevronRight,
  Refresh,
  DevicesOther,
  Add,
  FiberManualRecord
} from "@mui/icons-material";

const LiveVideoPlayer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [isLive, setIsLive] = useState(false);
  const [videoData, setVideoData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [liveStatus, setLiveStatus] = useState("Checking live status...");
  
  // Device integration from Store
  const { GetRegisterdDevices } = useStore();
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [noDevicesFound, setNoDevicesFound] = useState(false);
  const {checkLiveStatus, getFilteredVideos} =  useStore()



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

  // Navigate to device registration page
  const handleRegisterDevice = () => {
    navigate('/settings');
  };

  // Fetch registered devices
  const fetchDevices = async () => {
    setDeviceLoading(true);
    setNoDevicesFound(false);
    
    try {
      const response = await GetRegisterdDevices();
      
      if (response?.devices?.length > 0) {
        const options = response.devices.map((device) => ({
          value: device.deviceName,
          label: device.nickname || device.deviceName,
          code: device.deviceCode
        }));
        setDeviceOptions(options);
        
        // Initialize with the first device
        const initialDevice = options[0].value;
        setSelectedDevice(initialDevice);
        localStorage.setItem("Device", initialDevice);
      } else {
        // No devices found
        setNoDevicesFound(true);
        setDeviceOptions([]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching registered devices:", err);
      setError("Failed to fetch registered devices. Please try again later.");
      setDeviceOptions([]);
      setLoading(false);
    } finally {
      setDeviceLoading(false);
    }
  };

  // Function to check if the device is live
// Function to check if the device is live
// Updated `checkDeviceLiveStatus` to properly use `fromdate` and `todate`.
const checkDeviceLiveStatus = async () => {
  setLiveStatus("Checking live status...");
  const { formattedDate, currentTime, twoMinutesAgoTime } = getCurrentTimeInfo();


  try {
    const response = await checkLiveStatus(
      formattedDate,
      twoMinutesAgoTime,
      currentTime,
      selectedDevice
    );

    if (response.isLive) {
      setIsLive(true);
      setLiveStatus("Device is live");
      fetchVideos(); // Fetch videos if live
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
  if (!selectedDevice) return;

  const { currentTime } = getCurrentTimeInfo();

  const filter = {
    fromDate: formattedDate,
    toDate: formattedDate,
    fromTime: fromTime,
    toTime: currentTime,
    deviceCode: selectedDevice

  };

  try {
    const response = await getFilteredVideos(filter);  // Ensure filter is passed correctly

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
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    
    if (videoRef.current) {
      videoRef.current.volume = newValue;
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
  const handleDeviceChange = (event) => {
    const newDevice = event.target.value;
    setSelectedDevice(newDevice);
    setLoading(true);
    setIsLive(false);
    setVideoData([]);
    setCurrentVideoIndex(0);
    
    // Reset status and check the new device
    checkDeviceLiveStatus();
  };

  // Initial fetch of devices on component load
  useEffect(() => {
    fetchDevices();
    
    return () => {
      // Cleanup
      if (statusCheckIntervalRef.current) clearInterval(statusCheckIntervalRef.current);
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  // Start monitoring when device selection changes
  useEffect(() => {
    if (selectedDevice && !deviceLoading) {
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
    }
    
    return () => {
      // Cleanup
      if (statusCheckIntervalRef.current) clearInterval(statusCheckIntervalRef.current);
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
  }, [selectedDevice, deviceLoading]);

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

  // No Devices Found Component
  const NoDevicesFound = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 5,
        minHeight: 400,
        textAlign: 'center'
      }}
    >
      <DevicesOther sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
      
      <Typography variant="h5" gutterBottom>
        No Devices Registered
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        You don't have any registered devices, ManojGowda89. Register a device to start monitoring live video surveillance.
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<Add />}
        size="large"
        onClick={handleRegisterDevice}
        sx={{ mt: 2 }}
      >
        Register New Device
      </Button>
      
      <Button 
        variant="outlined"
        onClick={fetchDevices}
        startIcon={<Refresh />}
        sx={{ mt: 2 }}
      >
        Refresh
      </Button>
    </Box>
  );

  return (
    <Layout title="Dmarg - Live Surveillance">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ 
          borderBottom: '2px solid #1976d2', 
          pb: 1,
          mb: 3
        }}>
          Live Video Surveillance
        </Typography>
        
        {deviceLoading ? (
          // Loading state for devices
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '50vh'
          }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Loading devices...
            </Typography>
          </Box>
        ) : noDevicesFound ? (
          // No devices found state
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <NoDevicesFound />
          </Paper>
        ) : (
          <>
            {/* Header Section */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 3, 
                borderRadius: 2,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="h6" component="h2" sx={{ my: 0 }}>
                  Live Surveillance
                </Typography>
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-block', 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: isLive ? 'success.main' : 'error.main',
                    ml: 1
                  }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {liveStatus}
                </Typography>
              </Box>
              
              <FormControl 
                variant="outlined" 
                size={isMobile ? "medium" : "small"}
                sx={{ minWidth: isMobile ? '100%' : 220 }}
              >
                <InputLabel id="device-select-label">Select Device</InputLabel>
                <Select
                  labelId="device-select-label"
                  id="device-select"
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  label="Select Device"
                  disabled={loading || deviceOptions.length === 0}
                >
                  {deviceOptions.map((device) => (
                    <MenuItem key={device.value} value={device.value}>
                      {device.label} ({device.value})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
            
            {/* Main Content */}
            {loading ? (
              // Loading state for video
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '50vh',
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 2
              }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Connecting to device...
                </Typography>
              </Box>
            ) : (
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  bgcolor: '#000',
                  mb: 2
                }}
              >
                {isLive ? (
                  <Box 
                    sx={{ 
                      position: 'relative', 
                      width: '100%', 
                      aspectRatio: '16/9'
                    }}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouch}
                    onMouseLeave={() => isPlaying && setShowControls(false)}
                  >
                    <Box 
                      component="video"
                      ref={videoRef}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onClick={togglePlayPause}
                      onEnded={handleVideoEnd}
                      preload="auto"
                      playsInline
                    />
                    
                    <Fade in={showControls}>
                      <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: isMobile ? 1.5 : 2,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)',
                      }}>
                        <Box>
                          {videoData[currentVideoIndex] && (
                            <Typography 
                              variant={isMobile ? "body2" : "body1"} 
                              sx={{ 
                                color: '#fff', 
                                fontWeight: 'bold',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                              }}
                            >
                              {videoData[currentVideoIndex].filename}
                            </Typography>
                          )}
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          width: '100%'
                        }}>
                          <IconButton 
                            onClick={togglePlayPause}
                            color="primary"
                            sx={{ 
                              bgcolor: 'rgba(0,0,0,0.5)',
                              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                              color: '#fff',
                              width: isMobile ? 48 : 40,
                              height: isMobile ? 48 : 40
                            }}
                          >
                            {isPlaying ? <Pause /> : <PlayArrow />}
                          </IconButton>
                          
                          {!isMobile && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              width: 120,
                              mx: 2
                            }}>
                              <IconButton sx={{ color: '#fff' }}>
                                {volume === 0 ? <VolumeOff /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />}
                              </IconButton>
                              <Slider
                                value={volume}
                                min={0}
                                max={1}
                                step={0.1}
                                onChange={handleVolumeChange}
                                aria-labelledby="volume-slider"
                                sx={{ 
                                  color: '#fff',
                                  '& .MuiSlider-thumb': {
                                    width: 12,
                                    height: 12,
                                  }
                                }}
                              />
                            </Box>
                          )}
                          
                          <Chip 
                            label="LIVE" 
                            color="error" 
                            size={isMobile ? "medium" : "small"}
                            sx={{ 
                              animation: 'pulse 1.5s infinite',
                              '@keyframes pulse': {
                                '0%': { opacity: 1 },
                                '50%': { opacity: 0.7 },
                                '100%': { opacity: 1 }
                              },
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      </Box>
                    </Fade>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 5,
                    bgcolor: 'background.paper',
                    minHeight: 300
                  }}>
                    <Box 
                      component="img"
                      src="/notlive.gif"
                      alt="Device Offline"
                      sx={{ 
                        maxWidth: isMobile ? 150 : 200,
                        mb: 3
                      }}
                    />
                    
                    <Alert severity="info" sx={{ mb: 3, width: '100%', maxWidth: 500 }}>
                      {error || "Device is currently offline"}
                    </Alert>
                    
                    <Button 
                      variant="contained" 
                      startIcon={<Refresh />}
                      onClick={checkDeviceLiveStatus}
                      sx={{ 
                        minWidth: isMobile ? 240 : 200
                      }}
                    >
                      Retry Connection
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
            
            {isLive && videoData.length > 0 && (
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Streaming live footage from {selectedDevice}.
                  {videoData.length > 0 && ` Currently showing video #${currentVideoIndex + 1} of ${videoData.length}.`}
                </Typography>
              </Paper>
            )}
            
            {/* Add device button if needed */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleRegisterDevice}
              >
                Register New Device
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default LiveVideoPlayer;