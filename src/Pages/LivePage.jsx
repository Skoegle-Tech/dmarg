import React, { useState, useEffect, useRef } from "react";
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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Stack,
  Tooltip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar
} from "@mui/material";
import { 
  PlayArrow, 
  Pause, 
  VolumeUp, 
  VolumeOff, 
  VolumeDown,
  ChevronLeft,
  ChevronRight,
  FilterAlt,
  Refresh,
  DevicesOther,
  Add,
  Delete,
  CalendarMonth,
  AccessTime,
  Warning
} from "@mui/icons-material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const VideoPlayer = () => {
  const navigate = useNavigate();
  
  // Date formatting helpers
  const formatDate = (date) => {
    return dayjs(date).format('DD-MM-YYYY');
  };

  const formatDisplayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const today = formatDate(new Date());
  const currentUser = localStorage.getItem("custommerid") || "User";
  const [currentDateTime, setCurrentDateTime] = useState("2025-04-08 08:54:08");

  // Store integration
  const { GetRegisterdDevices, deleteRegesteredDevice } = useStore();
  
  // Device management states
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [noDevicesFound, setNoDevicesFound] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" // or "error"
  });

  // States for filtering - removed the separate toDate
  const [filter, setFilter] = useState({
    selectedDevice: "",
    fromDate: today,
    fromTime: "01:00:00",
    toTime: "23:00:00"
  });
  
  const [errors, setErrors] = useState({});
  
  // Video playback states
  const [videoData, setVideoData] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const {getFilteredVideos} =useStore()
  // Refs
  const videoRef = useRef(null);
  const nextVideoRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const timeUpdateIntervalRef = useRef(null);
  
  const currentVideo = videoData[currentVideoIndex] || null;

  // Update current date and time
  const updateCurrentDateTime = () => {
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    setCurrentDateTime(formattedDateTime);
  };

  // Navigate to device registration page
  const handleRegisterDevice = () => {
    navigate('/settings');
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    if (!filter.selectedDevice) return;
    const deviceToDelete = deviceOptions.find(device => device.value === filter.selectedDevice);
    if (deviceToDelete) {
      setDeletingDevice(deviceToDelete);
      setDeleteDialogOpen(true);
    }
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingDevice(null);
    setDeleteLoading(false);
  };

  // Delete the device
  const handleDeleteDevice = async () => {
    if (!deletingDevice) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteRegesteredDevice(deletingDevice.value);
      
      // Remove from device list
      const updatedOptions = deviceOptions.filter(d => d.value !== deletingDevice.value);
      setDeviceOptions(updatedOptions);
      
      // If we deleted the current device, select the first available one or show no devices
      if (updatedOptions.length === 0) {
        setNoDevicesFound(true);
        setSelectedDeviceIndex(-1);
        setFilter(prev => ({ ...prev, selectedDevice: "" }));
      } else if (filter.selectedDevice === deletingDevice.value) {
        setSelectedDeviceIndex(0);
        setFilter(prev => ({ ...prev, selectedDevice: updatedOptions[0].value }));
      }
      
      // Show success notification
      setNotification({
        open: true,
        message: `Device ${deletingDevice.label || deletingDevice.value} deleted successfully`,
        severity: "success"
      });
      
      // Clear video data if we've deleted the current device
      if (filter.selectedDevice === deletingDevice.value) {
        setVideoData([]);
        setCurrentVideoIndex(0);
      }
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Error deleting device:", err);
      setNotification({
        open: true,
        message: `Failed to delete device: ${err.message || "Unknown error"}`,
        severity: "error"
      });
      setDeleteLoading(false);
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Fetch registered devices
  const fetchDevices = async () => {
    setDeviceLoading(true);
    setNoDevicesFound(false);
    
    try {
      const response = await GetRegisterdDevices();
      console.log("Fetched devices:", response);
      
      if (response?.devices?.length > 0) {
        const options = response.devices.map((device) => ({
          value: device.deviceName,
          label: device.nickname || device.deviceName,
          code: device.deviceCode
        }));
        setDeviceOptions(options);
        setSelectedDeviceIndex(0);
        
        // Set the first device as the selected device
        setFilter(prev => ({ 
          ...prev, 
          selectedDevice: options[0].value 
        }));
      } else {
        // No devices found
        setNoDevicesFound(true);
        setDeviceOptions([]);
        setError(null); // Clear any existing errors
      }
    } catch (err) {
      console.error("Error fetching registered devices:", err);
      setError("Failed to fetch registered devices. Please try again later.");
      setDeviceOptions([]);
    } finally {
      setDeviceLoading(false);
    }
  };

  // Handle device navigation
  const goToNextDevice = () => {
    if (selectedDeviceIndex < deviceOptions.length - 1) {
      const newIndex = selectedDeviceIndex + 1;
      setSelectedDeviceIndex(newIndex);
      setFilter(prev => ({ 
        ...prev, 
        selectedDevice: deviceOptions[newIndex].value 
      }));
    }
  };

  const goToPreviousDevice = () => {
    if (selectedDeviceIndex > 0) {
      const newIndex = selectedDeviceIndex - 1;
      setSelectedDeviceIndex(newIndex);
      setFilter(prev => ({ 
        ...prev, 
        selectedDevice: deviceOptions[newIndex].value 
      }));
    }
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setFilter({ ...filter, [name]: formatDate(date) });
  };

  const handleTimeChange = (name, time) => {
    // Format time to HH:MM:SS
    const timeString = dayjs(time).format('HH:mm:ss');
    setFilter({ ...filter, [name]: timeString });
  };

  const handleDeviceChange = (event) => {
    const deviceName = event.target.value;
    const index = deviceOptions.findIndex(device => device.value === deviceName);
    setSelectedDeviceIndex(index);
    setFilter(prev => ({ ...prev, selectedDevice: deviceName }));
  };

  // Validate inputs before fetching videos
  const validateInputs = () => {
    const newErrors = {};
    
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

  // Fetch videos from API - using fromDate for both fromdate and todate parameters
  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
    const data =  await getFilteredVideos(filter)
      
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

  // Video navigation functions
  const goToNextVideo = () => {
    if (currentVideoIndex < videoData.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      showControlsTemporarily();
    }
  };

  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      showControlsTemporarily();
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

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    
    if (videoRef.current) {
      videoRef.current.volume = newValue;
    }
    
    showControlsTemporarily();
  };

  const handleSliderChange = (event, newValue) => {
    setCurrentVideoIndex(newValue);
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
    if (filter.selectedDevice) {
      localStorage.setItem("Device", filter.selectedDevice);
    }
  }, [filter.selectedDevice]);

  // Initial fetch of devices on component load and set up date time update
  useEffect(() => {
    fetchDevices();
    updateCurrentDateTime();
    
    // Set up time update interval
    timeUpdateIntervalRef.current = setInterval(() => {
      updateCurrentDateTime();
    }, 1000);
    
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Fetch videos when device is loaded
  useEffect(() => {
    if (filter.selectedDevice && !deviceLoading && !noDevicesFound) {
      fetchVideos();
    }
  }, [filter.selectedDevice, deviceLoading, noDevicesFound]);

  // Get current device display name
  const getCurrentDeviceDisplayName = () => {
    if (deviceOptions.length === 0 || selectedDeviceIndex < 0) return "";
    const device = deviceOptions[selectedDeviceIndex];
    return device.label || device.value;
  };

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
        You don't have any registered devices, {currentUser}. Register a device to start monitoring video surveillance.
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
    <Layout title="Dmarg - Video Surveillance">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ 
          borderBottom: '2px solid #1976d2', 
          pb: 1,
          mb: 3
        }}>
          Video Surveillance Player
        </Typography>
        
        {/* Current User and Time information */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 2,
          gap: 1
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
            Current Date and Time (UTC): {currentDateTime}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Current User's Login: <b>{currentUser}</b>
          </Typography>
        </Box>
        
        {deviceLoading ? (
          // Loading state
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
          // Normal view with devices
          <Grid container spacing={3}>
            {/* Video Player Section - Left Side (8/12 width) */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                sx={{ 
                  position: 'relative', 
                  overflow: 'hidden',
                  borderRadius: 2,
                  height: '100%',
                  minHeight: 500,
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                {/* Device Navigation */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1, 
                  borderBottom: '1px solid #eee'
                }}>
                  <IconButton 
                    onClick={goToPreviousDevice} 
                    disabled={selectedDeviceIndex <= 0 || deviceOptions.length <= 1}
                  >
                    <ChevronLeft />
                  </IconButton>
                  
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {getCurrentDeviceDisplayName()}
                  </Typography>
                  
                  <IconButton 
                    onClick={goToNextDevice} 
                    disabled={selectedDeviceIndex >= deviceOptions.length - 1 || deviceOptions.length <= 1}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>
                
                {/* Video Content */}
                <Box sx={{ flexGrow: 1, position: 'relative', bgcolor: '#000', aspectRatio: '16/9' }}>
                  {loading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <CircularProgress />
                      <Typography sx={{ mt: 2, color: '#fff' }}>
                        Loading videos...
                      </Typography>
                    </Box>
                  ) : error ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      p: 3
                    }}>
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                      <Button 
                        variant="contained" 
                        startIcon={<Refresh />}
                        onClick={handleFilter}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : videoData.length > 0 ? (
                    <>
                      <Box 
                        component="video"
                        ref={videoRef}
                        src={currentVideo?.url}
                        sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onEnded={handleVideoEnd}
                        autoPlay
                        onTimeUpdate={updateCurrentTime}
                        preload="auto"
                        onClick={togglePlayPause}
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
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 100%)',
                        }}>
                          <Box sx={{ p: 2 }}>
                            {currentVideo && (
                              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 'bold' }}>
                                {currentVideo.filename} ({currentVideo.fromtime} - {currentVideo.totime})
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            p: 2
                          }}>
                            <IconButton 
                              onClick={togglePlayPause}
                              sx={{ 
                                color: '#fff', 
                                bgcolor: 'rgba(0,0,0,0.5)',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                              }}
                            >
                              {isPlaying ? <Pause /> : <PlayArrow />}
                            </IconButton>
                            
                            <Typography sx={{ color: '#fff', fontFamily: 'monospace', width: 80 }}>
                              {currentTime}
                            </Typography>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Slider
                                value={currentVideoIndex}
                                min={0}
                                max={videoData.length - 1}
                                onChange={handleSliderChange}
                                aria-labelledby="video-timeline-slider"
                                sx={{
                                  color: '#1976d2',
                                  '& .MuiSlider-thumb': {
                                    width: 12,
                                    height: 12,
                                  },
                                }}
                              />
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                color: '#fff',
                                fontSize: '0.75rem'
                              }}>
                                <span>{videoData[0]?.fromtime}</span>
                                <span>{videoData[videoData.length - 1]?.totime}</span>
                              </Box>
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              width: 120 
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
                                  color: '#1976d2',
                                  '& .MuiSlider-thumb': {
                                    width: 12,
                                    height: 12,
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Fade>
                    </>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      p: 3 
                    }}>
                      <Typography>
                        No videos found. Please adjust your filter criteria and try again.
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Video navigation buttons */}
                {videoData.length > 0 && (
                  <Box sx={{ 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title="Previous Video">
                        <span>
                          <IconButton 
                            onClick={goToPreviousVideo}
                            disabled={currentVideoIndex <= 0}
                            color="primary"
                            size="small"
                          >
                            <ChevronLeft />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Typography variant="body2" sx={{ mx: 2 }}>
                        Video {currentVideoIndex + 1} of {videoData.length}
                      </Typography>
                      
                      <Tooltip title="Next Video">
                        <span>
                          <IconButton 
                            onClick={goToNextVideo}
                            disabled={currentVideoIndex >= videoData.length - 1}
                            color="primary"
                            size="small"
                          >
                            <ChevronRight />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    
                    {currentVideo && (
                      <Typography variant="caption" color="text.secondary">
                        {currentVideo.fromtime} - {currentVideo.totime}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Filter Controls Section - Right Side (4/12 width) */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ 
                  borderBottom: '1px solid #eee',
                  pb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <FilterAlt fontSize="small" />
                  Filter Options
                </Typography>
                
                <Stack spacing={3} sx={{ mt: 3 }}>
                  {/* Device Selection */}
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="device-select-label">Select Device</InputLabel>
                    <Select
                      labelId="device-select-label"
                      id="device-select"
                      value={filter.selectedDevice}
                      onChange={handleDeviceChange}
                      label="Select Device"
                      disabled={deviceOptions.length === 0}
                    >
                      {deviceOptions.map((device, index) => (
                        <MenuItem key={device.value} value={device.value}>
                          {device.label} ({device.value})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={handleRegisterDevice}
                    >
                      Register Device
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleOpenDeleteDialog}
                      disabled={!filter.selectedDevice}
                    >
                      Delete Device
                    </Button>
                  </Box>
                  
                  <Divider />
                  
                  {/* Single Date Selection */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarMonth color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">Select Date</Typography>
                      </Box>
                      
                      <DatePicker
                        label="Date"
                        value={dayjs(filter.fromDate.split('-').reverse().join('-'))}
                        onChange={(date) => handleDateChange('fromDate', date)}
                        slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      />
                    </Box>
                  </LocalizationProvider>
                  
                  <Divider />
                  
                  {/* Time Selection */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TimePicker
                        label="From Time"
                        value={dayjs(`1970-01-01T${filter.fromTime}`)}
                        onChange={(time) => handleTimeChange('fromTime', time)}
                        slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      />
                      
                      <TimePicker
                        label="To Time"
                        value={dayjs(`1970-01-01T${filter.toTime}`)}
                        onChange={(time) => handleTimeChange('toTime', time)}
                        slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                      />
                      
                      {errors.time && (
                        <Alert severity="error">{errors.time}</Alert>
                      )}
                    </Box>
                  </LocalizationProvider>
                  
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    fullWidth
                    onClick={handleFilter}
                    disabled={loading}
                    startIcon={<FilterAlt />}
                    sx={{ mt: 2 }}
                  >
                    {loading ? "Loading..." : "Apply Filter"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            Delete Device
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete the device 
              <Typography component="span" fontWeight="bold" mx={0.5}>
                {deletingDevice?.label || deletingDevice?.value}
              </Typography>? 
              This action cannot be undone and all associated data will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteDevice} 
              color="error" 
              variant="contained"
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleNotificationClose} 
            severity={notification.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default VideoPlayer;