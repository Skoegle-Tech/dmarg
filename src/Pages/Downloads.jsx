import React, { useEffect, useState, useCallback, useRef } from "react";
import JSZip from "jszip";
import { useStore } from "../Store/Store";
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  useMediaQuery,
  Grid,
  Snackbar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  useTheme
} from "@mui/material";
import {
  ExpandMore,
  AccessTime,
  DevicesOther,
  Add,
  Warning,
  FilterAlt,
  CloudDownload,
  ArrowDownward,
  CalendarMonth
} from "@mui/icons-material";
import Layout from "../Layout/Layout";

export default function Downloads() {
  const navigate = useNavigate();
  const theme = useTheme();
  // Check if the device is mobile
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Store integration for devices
  const { GetRegisterdDevices } = useStore();
  
  // Date and time handling
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const today = formatDate(new Date());
  
  // Device states
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [deviceLoading, setDeviceLoading] = useState(true);
  const [noDevicesFound, setNoDevicesFound] = useState(false);
  
  // Filter states
  const [selectedDevice, setSelectedDevice] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [fromTime, setFromTime] = useState("01:00:00");
  const [toTime, setToTime] = useState("23:00:00");
  
  // Data states
  const [videoData, setVideoData] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [downloadLinks, setDownloadLinks] = useState([]);
  
  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [batchProgress, setBatchProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState(0); // in KB/s
  const [processedFiles, setProcessedFiles] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  
  // UI states
  const [fetchingData, setFetchingData] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [batchSize, setBatchSize] = useState(5); // Number of files per batch
  const [failedDownloads, setFailedDownloads] = useState([]);
 const {getFilteredVideos}=  useStore()
  // Refs for tracking download performance
  const downloadStartTimeRef = useRef(null);
  const speedMeasurementsRef = useRef([]);
  
  const [currentFilter, setCurrentFilter] = useState({
    selectedDevice: "",
    fromDate: today,
    fromTime: "01:00:00",
    toTime: "23:00:00",
  });

  // User info displayed in the UI
  const currentUser = localStorage.getItem("custommerid") || "User";
  // const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Steps for the download process
  const downloadSteps = [
    'Prepare Files',
    'Download Files',
    'Create ZIP Archive',
    'Complete'
  ];

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
        
        // Update current filter with selected device
        setCurrentFilter(prev => ({
          ...prev,
          selectedDevice: initialDevice
        }));
      } else {
        // No devices found
        setNoDevicesFound(true);
        setDeviceOptions([]);
        setSelectedDevice("");
      }
    } catch (err) {
      console.error("Error fetching registered devices:", err);
      showNotification("Failed to fetch registered devices. Please try again later.", "error");
      setDeviceOptions([]);
      setNoDevicesFound(true);
    } finally {
      setDeviceLoading(false);
    }
  };

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return "Calculating...";
    
    if (seconds < 60) return `${Math.floor(seconds)} seconds`;
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes} min ${secs} sec`;
    }
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hr ${minutes} min`;
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Validate inputs before fetching videos
  const validateInputs = () => {
    const newErrors = {};
    
    // Only validate time now since we don't have "to date" anymore
    if (fromTime > toTime) {
      newErrors.time = "From Time cannot be later than To Time.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle filter application
  const handleFilter = () => {
    if (!selectedDevice) {
      showNotification("Please select a device first", "warning");
      return;
    }
    
    if (validateInputs()) {
      setFetchingData(true);
      setSelectedVideos(new Set()); // Reset selections when filter changes
      
      const newFilter = {
        selectedDevice,
        fromDate,
        fromTime,
        toTime,
      };
      
      setCurrentFilter(newFilter);
      
      // Close filters on mobile after applying
      if (isMobile) {
        setShowFilters(false);
      }
    }
  };

  // Checkbox handlers
  const handleCheckboxChange = (videoId) => {
    const updatedSelectedVideos = new Set(selectedVideos);
    
    if (updatedSelectedVideos.has(videoId)) {
      updatedSelectedVideos.delete(videoId);
    } else {
      updatedSelectedVideos.add(videoId);
    }
    
    setSelectedVideos(updatedSelectedVideos);
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videoData.length) {
      setSelectedVideos(new Set());
    } else {
      const allVideoIds = new Set(videoData.map((video) => video._id));
      setSelectedVideos(allVideoIds);
    }
  };

  // Fetch videos from API with error handling
  const fetchVideos = useCallback(async () => {
    console.log("Fetching videos with filter:", currentFilter);
    if (!currentFilter.selectedDevice) return;
    
    setFetchingData(true);
    // currentFilter.toDate = currentFilter.fromDate; // Use the same date for both fromDate and toDate
    try {
      // Using the same fromDate for both fromdate and todate params
     const data = await getFilteredVideos(currentFilter)
      
      if (data.length === 0) {
        showNotification("No videos found for the selected criteria", "info");
      } else {
        showNotification(`Found ${data.length} videos`, "success");
      }
      
      // Sort videos by time
      setVideoData(data.sort((a, b) => a.fromtime.localeCompare(b.fromtime)));
    } catch (err) {
      console.error(err.message);
      showNotification("Error fetching videos. Please try again.", "error");
      setVideoData([]);
    } finally {
      setFetchingData(false);
    }
  }, [currentFilter]);

  // Display notification
  const showNotification = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  // Update download speed and estimated time
  const updateDownloadStats = (newBytesDownloaded) => {
    const now = Date.now();
    const elapsedMs = now - (downloadStartTimeRef.current || now);
    
    if (elapsedMs > 0 && newBytesDownloaded > 0) {
      const currentSpeed = (newBytesDownloaded / elapsedMs) * 1000 / 1024; // KB/s
      
      speedMeasurementsRef.current.push(currentSpeed);
      
      // Keep only the last 5 measurements for averaging
      if (speedMeasurementsRef.current.length > 5) {
        speedMeasurementsRef.current.shift();
      }
      
      // Calculate average speed
      const avgSpeed = speedMeasurementsRef.current.reduce((a, b) => a + b, 0) / 
                      speedMeasurementsRef.current.length;
      
      setDownloadSpeed(avgSpeed);
      
      // Calculate estimated time remaining based on remaining bytes and average speed
      const remainingBytes = totalSize - downloadedSize;
      if (avgSpeed > 0) {
        const remainingSeconds = remainingBytes / 1024 / avgSpeed;
        setEstimatedTimeRemaining(formatTime(remainingSeconds));
      }
    }
  };

  // Download a single file and track progress
  const downloadFile = async (video) => {
    try {
      if (!downloadStartTimeRef.current) {
        downloadStartTimeRef.current = Date.now();
      }
      
      const response = await fetch(video.url, { mode: 'cors' });
      
      if (!response.ok) {
        throw new Error(`Failed to download ${video.filename}`);
      }
      
      // Get file size from headers if available
      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Download file as blob
      const blob = await response.blob();
      const actualSize = blob.size;
      
      setDownloadedSize(prev => prev + actualSize);
      updateDownloadStats(actualSize);
      
      // Ensure filename ends with .mp4
      const filename = video.filename.endsWith(".mp4") ? video.filename : `${video.filename}.mp4`;
      
      return { filename, blob, success: true };
    } catch (err) {
      console.error(`Error downloading ${video.filename}:`, err);
      return { filename: video.filename, success: false, error: err.message };
    }
  };

  // Process videos in batches
  const processVideosInBatches = async (selectedVideosArray, zip) => {
    setActiveStep(1); // Move to "Download Files" step
    const batches = [];
    for (let i = 0; i < selectedVideosArray.length; i += batchSize) {
      batches.push(selectedVideosArray.slice(i, i + batchSize));
    }
    
    setTotalBatches(batches.length);
    setFailedDownloads([]);
    
    let processedCount = 0;
    let totalDownloaded = 0;
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      setCurrentBatch(batchIndex + 1);
      setBatchProgress(0);
      
      const batch = batches[batchIndex];
      const batchResults = await Promise.all(batch.map(async video => {
        const result = await downloadFile(video);
        
        processedCount++;
        setProcessedFiles(processedCount);
        setDownloadProgress(Math.round((processedCount / selectedVideosArray.length) * 100));
        
        return result;
      }));
      
      // Process the batch results
      batchResults.forEach(result => {
        if (result.success) {
          zip.file(result.filename, result.blob);
          totalDownloaded++;
        } else {
          setFailedDownloads(prev => [...prev, { filename: result.filename, error: result.error }]);
        }
      });
      
      setBatchProgress(100);
    }
    
    return totalDownloaded;
  };

  // Main download handler
  const handleDownloadAll = async () => {
    if (selectedVideos.size === 0) {
      showNotification("Please select at least one video to download", "warning");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setBatchProgress(0);
    setCurrentBatch(0);
    setTotalBatches(0);
    setProcessedFiles(0);
    setEstimatedTimeRemaining('');
    setDownloadedSize(0);
    setTotalSize(0);
    setActiveStep(0);
    downloadStartTimeRef.current = null;
    speedMeasurementsRef.current = [];
    
    const zip = new JSZip();
    
    try {
      // Step 1: Prepare files
      const selectedVideosArray = Array.from(selectedVideos).map(id => 
        videoData.find(video => video._id === id)
      ).filter(Boolean);
      
      setDownloadLinks(selectedVideosArray);
      showNotification(`Preparing to download ${selectedVideosArray.length} videos...`, "info");
      
      // Estimate total size (rough estimate as we don't have file sizes before download)
      // Assuming average file size of 5MB per video
      const estimatedTotalSize = selectedVideosArray.length * 5 * 1024 * 1024;
      setTotalSize(estimatedTotalSize);
      
      // Step 2: Download files in batches
      const totalDownloaded = await processVideosInBatches(selectedVideosArray, zip);
      
      // Step 3: Generate ZIP
      setActiveStep(2);
      showNotification("Creating ZIP archive...", "info");
      
      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
        onUpdate: (metadata) => {
          // Update progress during ZIP generation
          if (metadata.percent) {
            setBatchProgress(Math.round(metadata.percent));
          }
        }
      });
      
      // Step 4: Complete and download
      setActiveStep(3);
      
      // Create and click download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `videos-${formatDate(new Date()).replace(/-/g, '')}-${currentUser}.zip`;
      link.click();
      
      const successMessage = `Successfully downloaded ${totalDownloaded} videos of ${selectedVideosArray.length}`;
      showNotification(successMessage, "success");
      
      // If any files failed to download, show the dialog
      if (failedDownloads.length > 0) {
        setDownloadDialogOpen(true);
      }
    } catch (err) {
      console.error("Error in ZIP download:", err);
      showNotification("Error during download process. Some files may not have been downloaded.", "error");
      setDownloadDialogOpen(true);
    } finally {
      setIsDownloading(false);
    }
  };

  // Individual video download handler
  const handleIndividualDownload = (video) => {
    window.open(video.url, '_blank');
  };

  // Toggle filter panel visibility (for mobile)
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Fetch videos when filter changes
  useEffect(() => {
    if (currentFilter.selectedDevice) {
      fetchVideos();
    }
  }, [fetchVideos, currentFilter]);

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
        You don't have any registered devices, {currentUser}. Register a device to start downloading videos.
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
    <Layout title="Dmarg - Video Downloads">
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Video Downloads
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  {/* <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                    Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}
                  </Typography> */}
                  <Typography variant="body2" color="textSecondary">
                    Current User's Login: {currentUser}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
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
            {/* Mobile filter toggle */}
            {isMobile && (
              <Button
                variant="outlined"
                onClick={toggleFilters}
                fullWidth
                sx={{ mb: 2 }}
                startIcon={<FilterAlt />}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            )}
            
            {/* Filter section */}
            {showFilters && (
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    borderBottom: '1px solid #eee',
                    pb: 1,
                    mb: 2
                  }}>
                    <FilterAlt fontSize="small" sx={{ mr: 1 }} />
                    Filter Options
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Select Device"
                        value={selectedDevice}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                      >
                        {deviceOptions.map((device) => (
                          <MenuItem key={device.value} value={device.value}>
                            {device.label} ({device.value})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    {/* Single Date Selection */}
                    <Grid item xs={12} sm={6}>
                      {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarMonth color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2">Select Date</Typography>
                      </Box> */}
                      
                      <TextField
                        type="date"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={fromDate.split("-").reverse().join("-")}
                        onChange={(e) => setFromDate(formatDate(e.target.value))}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6} container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          type="time"
                          label="From Time"
                          InputLabelProps={{ shrink: true }}
                          value={fromTime}
                          onChange={(e) => setFromTime(e.target.value)}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          error={!!errors.time}
                          helperText={errors.time}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          type="time"
                          label="To Time"
                          InputLabelProps={{ shrink: true }}
                          value={toTime}
                          onChange={(e) => setToTime(e.target.value)}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleFilter}
                        fullWidth
                        disabled={fetchingData}
                        startIcon={<FilterAlt />}
                        sx={{ mt: 1 }}
                      >
                        {fetchingData ? "Loading..." : "Apply Filter"}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
            
            {/* Status display */}
            {fetchingData && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Fetching videos...
                </Typography>
              </Box>
            )}
            
            {/* Video list and selection controls */}
            {!fetchingData && videoData.length > 0 && (
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedVideos.size === videoData.length && videoData.length > 0}
                          onChange={handleSelectAll}
                          indeterminate={selectedVideos.size > 0 && selectedVideos.size < videoData.length}
                          color="primary"
                        />
                      }
                      label={`Select All (${videoData.length})`}
                    />
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDownloadAll}
                      disabled={selectedVideos.size === 0 || isDownloading}
                      startIcon={<CloudDownload />}
                    >
                      {isDownloading ? "Downloading..." : `Download Selected (${selectedVideos.size})`}
                    </Button>
                  </Box>
                  
                  {isDownloading && (
                    <Card sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                        {downloadSteps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        {downloadSteps[activeStep]}
                        {activeStep === 1 && totalBatches > 0 && ` (Batch ${currentBatch} of ${totalBatches})`}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={activeStep === 1 ? batchProgress : downloadProgress} 
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {activeStep === 1 ? `${Math.round(batchProgress)}%` : `${Math.round(downloadProgress)}%`}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Files: {processedFiles} / {selectedVideos.size}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" align="right">
                            Speed: {downloadSpeed.toFixed(1)} KB/s
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Downloaded: {formatFileSize(downloadedSize)} / Est. {formatFileSize(totalSize)}
                      </Typography>
                      
                      {estimatedTimeRemaining && (
                        <Typography variant="body2" color="text.secondary">
                          Estimated time remaining: {estimatedTimeRemaining}
                        </Typography>
                      )}
                      
                      {activeStep === 2 && (
                        <Typography variant="body2" color="text.secondary">
                          Creating ZIP archive...
                        </Typography>
                      )}
                    </Card>
                  )}

                  {/* Note about video sources */}
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Videos are downloaded from secure cloud storage. Download speeds may vary based on your internet connection.
                  </Alert>

                  {isMobile ? (
                    // Mobile card view
                    <Box sx={{ mt: 2 }}>
                      {videoData.map((video) => (
                        <Accordion key={video._id} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Checkbox
                                checked={selectedVideos.has(video._id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(video._id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                edge="start"
                                color="primary"
                              />
                              <Typography sx={{ ml: 1, flexGrow: 1 }}>
                                {video.filename}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2"><strong>Date:</strong> {video.date}</Typography>
                            <Typography variant="body2"><strong>Time:</strong> {video.fromtime} - {video.totime}</Typography>
                            <Button 
                              variant="outlined"
                              onClick={() => handleIndividualDownload(video)}
                              sx={{ mt: 1 }}
                              size="small"
                              fullWidth
                              startIcon={<ArrowDownward />}
                            >
                              Open Video
                            </Button>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    // Desktop table view
                    <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">Select</TableCell>
                            <TableCell>Filename</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>From Time</TableCell>
                            <TableCell>To Time</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {videoData.map((video) => (
                            <TableRow 
                              key={video._id} 
                              hover 
                              selected={selectedVideos.has(video._id)}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedVideos.has(video._id)}
                                  onChange={() => handleCheckboxChange(video._id)}
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell>{video.filename}</TableCell>
                              <TableCell>{video.date}</TableCell>
                              <TableCell>{video.fromtime}</TableCell>
                              <TableCell>{video.totime}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  onClick={() => handleIndividualDownload(video)}
                                  variant="outlined"
                                  startIcon={<ArrowDownward />}
                                >
                                  Open Video
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* No videos message */}
            {!fetchingData && videoData.length === 0 && currentFilter.selectedDevice && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No videos found for the selected filters. Please try different filter criteria.
              </Alert>
            )}
            
            {/* Device management buttons */}
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
        
        {/* Failed Downloads Dialog */}
        <Dialog
          open={downloadDialogOpen}
          onClose={() => setDownloadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="error" sx={{ mr: 1 }} /> 
            Failed Downloads
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              Some videos couldn't be downloaded directly due to security restrictions.
              You can download them individually by clicking on each link below:
            </Typography>
            
            <List>
              {failedDownloads.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={item.filename}
                    secondary={item.error}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const video = videoData.find(v => v.filename === item.filename);
                      if (video) handleIndividualDownload(video);
                    }}
                    startIcon={<ArrowDownward />}
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDownloadDialogOpen(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Notifications */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSnackbar(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}