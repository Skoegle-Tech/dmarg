import React, { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import Layout from "../../Layout/Layout";
import { useStore } from "../../Store/Store";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Container,
  Alert,
  Snackbar,
  Grid,
  Fade,
  Typography,
  Button
} from '@mui/material';

// Firebase imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, get } from "firebase/database";
import { firebaseConfig } from "../Firebase";
import { CloudQueue as CloudIcon, Storage as StorageIcon } from '@mui/icons-material';
import Skeleton from '@mui/material/Skeleton';
// Import components
import DeviceNavigation from './DeviceNavigation';
import MapView from './MapView';
import DeviceStatusCard from './DeviceStatusCard';
import GeofenceSettings from './GeofenceSettings';
import ActionButtons from './ActionButtons';
import DataSourceSwitch from './DataSourceSwitch';
import NoDeviceMessage from './NoDeviceMessage';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function Live() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { 
    addGeofencingDevice, 
    deleteGeofencingDevice, 
    getGeofencingData, 
    getRealTimeData, 
    updateGeofencingRadius,
    GetRegisterdDevices, 
    deleteRegesteredDevice 
  } = useStore();

  const mapRef = useRef(null);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [deviceData, setDeviceData] = useState({});
  const [deviceSources, setDeviceSources] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const defaultLatLng = { lat: 20.5937, lng: 78.9629 }; // India's center coordinates
  const [sliderValue, setSliderValue] = useState(1);
  const [errorSnackbar, setErrorSnackbar] = useState({ open: false, message: "" });
  const [successSnackbar, setSuccessSnackbar] = useState({ open: false, message: "" });
  const [dataSourceInfo, setDataSourceInfo] = useState({ visible: false, message: "" });

  // Get the current selected device based on the index
  const selectedDevice = deviceOptions[selectedDeviceIndex]?.value || "";
  const currentDeviceLabel = deviceOptions[selectedDeviceIndex]?.label || "No Device";

  // Load the data source info from localStorage
  useEffect(() => {
    const loadDataSources = () => {
      const savedSources = localStorage.getItem("deviceDataSources");
      if (savedSources) {
        setDeviceSources(JSON.parse(savedSources));
      }
    };
    
    loadDataSources();
  }, []);

  // Save data sources to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(deviceSources).length > 0) {
      localStorage.setItem("deviceDataSources", JSON.stringify(deviceSources));
    }
  }, [deviceSources]);

  // Show data source info when selected device changes
  useEffect(() => {
    if (selectedDevice && deviceSources[selectedDevice]) {
      const source = deviceSources[selectedDevice];
      setDataSourceInfo({
        visible: true,
        message: `Data from ${source === 'firebase' ? 'Firebase (realtime)' : 'API'}`
      });
      
      // Hide the info after 3 seconds
      const timer = setTimeout(() => {
        setDataSourceInfo({ visible: false, message: "" });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDevice, deviceSources]);

  // Navigation functions
  const goToNextDevice = () => {
    if (selectedDeviceIndex < deviceOptions.length - 1) {
      setSelectedDeviceIndex(selectedDeviceIndex + 1);
    } else {
      setSelectedDeviceIndex(0); // Loop back to the first device
    }
  };

  const goToPreviousDevice = () => {
    if (selectedDeviceIndex > 0) {
      setSelectedDeviceIndex(selectedDeviceIndex - 1);
    } else {
      setSelectedDeviceIndex(deviceOptions.length - 1); // Loop to the last device
    }
  };

  // Select a specific device by index
  const handleDeviceSelect = (index) => {
    setSelectedDeviceIndex(index);
  };

  // Try to fetch data from Firebase first, then fall back to API
  const fetchDeviceDataHybrid = async (device) => {
    if (!device) return;
    
    try {
      // First try Firebase
      const gpsRef = ref(database, `${device}/Realtime`);
      const snapshot = await get(gpsRef);
      const firebaseData = snapshot.val();
      
      if (firebaseData?.timestamp) {
        const [date, time, lat, lng] = firebaseData.timestamp.split(",");
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        // Update the device data
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...(prev[device] || {}),
            lat: latitude,
            lng: longitude,
            lastUpdated: `${date} ${time}`,
            found: true,
          },
        }));
        setMapCenter({ lat: latitude, lng: longitude });
        
        // Mark this device as using Firebase
        setDeviceSources(prev => ({ ...prev, [device]: 'firebase' }));
        
        return true; // Return true to indicate success
      }
      
      // If Firebase didn't have data, try the API
      const apiData = await getRealTimeData(device);
      
      if (apiData?.time && apiData?.date) {
        const latitude = parseFloat(apiData.latitude);
        const longitude = parseFloat(apiData.longitude);

        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...(prev[device] || {}),
            lat: latitude,
            lng: longitude,
            lastUpdated: `${apiData.date} ${apiData.time}`,
            found: true,
          },
        }));
        setMapCenter({ lat: latitude, lng: longitude });
        
        // Mark this device as using API
        setDeviceSources(prev => ({ ...prev, [device]: 'api' }));
        
        return true;
      } else {
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...(prev[device] || {}),
            found: false 
          },
        }));
        return false;
      }
    } catch (error) {
      console.error("Error fetching device data:", error);
      setErrorSnackbar({
        open: true,
        message: "Failed to fetch device data"
      });
      return false;
    }
  };

  // Fetch geofencing data with Firebase first, then API fallback approach
  const fetchGeofencingDataHybrid = async (device) => {
    try {
      // Try Firebase first
      const geofencingRef = ref(database, `${device}/geofencing`);
      const snapshot = await get(geofencingRef);
      const firebaseData = snapshot.val();
      
      if (firebaseData) {
        // Get additional data if available
        const batteryRef = ref(database, `${device}/battery`);
        const mainRef = ref(database, `${device}/main`);
        
        const [batterySnapshot, mainSnapshot] = await Promise.allSettled([
          get(batteryRef),
          get(mainRef)
        ]);
        
        const battery = batterySnapshot.status === 'fulfilled' ? batterySnapshot.value.val() : null;
        const main = mainSnapshot.status === 'fulfilled' ? mainSnapshot.value.val() : null;
        
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: {
              lat: firebaseData.lat,
              lng: firebaseData.lng,
              radius: firebaseData.radius || 1,
              battery: battery,
              main: main
            },
          }
        }));
        
        // Set the slider to match the current radius
        if (firebaseData.radius && device === selectedDevice) {
          setSliderValue(firebaseData.radius);
        }
        
        return true;
      }
      
      // If Firebase didn't have data, try the API
      const apiData = await getGeofencingData(device);
      
      if (apiData?._id) {
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: {
              lat: apiData.latitude,
              lng: apiData.longitude,
              main: apiData.main,
              battery: apiData.battery,
              radius: apiData.radius,
            },
          }
        }));
        
        // Set the slider to match the current radius
        if (apiData.radius && device === selectedDevice) {
          setSliderValue(apiData.radius);
        }
        
        return true;
      } else {
        setDeviceData((prev) => ({
          ...prev,
          [device]: {
            ...prev[device],
            geofencing: false,
          }
        }));
        
        return false;
      }
    } catch (error) {
      console.error("Error fetching geofencing data:", error);
      setErrorSnackbar({
        open: true,
        message: "Failed to fetch geofencing data"
      });
      
      return false;
    }
  };

  // Function to update radius via Firebase or API
  const updateRadius = async (device, radius) => {
    try {
      const source = deviceSources[device] || 'api';
      
      if (source === 'firebase') {
        // Update radius in Firebase
        await set(ref(database, `${device}/geofencing/radius`), radius);
      } else {
        // Update via API
        await updateGeofencingRadius(device, radius);
      }
      
      // Update local state to reflect the new radius
      setDeviceData((prev) => ({
        ...prev,
        [device]: {
          ...prev[device],
          geofencing: {
            ...prev[device].geofencing,
            radius: radius,
          }
        }
      }));
      
      setSuccessSnackbar({
        open: true,
        message: `Radius updated to ${radius}km successfully`
      });
    } catch (error) {
      console.error("Error updating radius:", error);
      setErrorSnackbar({
        open: true,
        message: "Failed to update radius"
      });
    }
  };

  // Handle slider change
  const handleSliderChange = (e, newValue) => {
    setSliderValue(newValue);
  };

  // Apply radius change when slider is released
  const handleSliderCommit = (e, newValue) => {
    if (selectedDevice) {
      updateRadius(selectedDevice, newValue);
    }
  };

  // Setup real-time listeners for Firebase devices
  const setupFirebaseListeners = (devices) => {
    const listeners = [];
    
    devices.forEach(device => {
      // Check if this device should use Firebase (if it has a saved source)
      const savedSource = deviceSources[device.value];
      if (savedSource === 'firebase') {
        const gpsRef = ref(database, `${device.value}/Realtime`);
        const unsubscribe = onValue(gpsRef, (snapshot) => {
          const data = snapshot.val();
          if (data?.timestamp) {
            const [date, time, lat, lng] = data.timestamp.split(",");
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            
            setDeviceData((prev) => ({
              ...prev,
              [device.value]: {
                ...(prev[device.value] || {}),
                lat: latitude,
                lng: longitude,
                lastUpdated: `${date} ${time}`,
                found: true,
              },
            }));
            
            if (device.value === selectedDevice) {
              setMapCenter({ lat: latitude, lng: longitude });
            }
          }
        });
        
        listeners.push(unsubscribe);
        
        // Also set up geofencing listener if using Firebase
        const geofencingRef = ref(database, `${device.value}/geofencing`);
        const geofencingUnsubscribe = onValue(geofencingRef, (snapshot) => {
          const geofencingData = snapshot.val();
          if (geofencingData) {
            setDeviceData((prev) => ({
              ...prev,
              [device.value]: {
                ...(prev[device.value] || {}),
                geofencing: {
                  lat: geofencingData.lat,
                  lng: geofencingData.lng,
                  radius: geofencingData.radius || 1,
                  battery: geofencingData.battery,
                  main: geofencingData.main,
                },
              }
            }));
            
            if (device.value === selectedDevice && geofencingData.radius) {
              setSliderValue(geofencingData.radius);
            }
          }
        });
        
        listeners.push(geofencingUnsubscribe);
      }
    });
    
    return listeners;
  };

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const response = await GetRegisterdDevices();
        if (response?.devices?.length > 0) {
          const options = response.devices.map((device) => ({
            value: device.deviceName,
            label: device.nickname || device.deviceName,
          }));
          setDeviceOptions(options);
          setSelectedDeviceIndex(0); // Start with the first device
          
          // For each device, fetch data using the hybrid approach
          for (const option of options) {
            await fetchDeviceDataHybrid(option.value);
            await fetchGeofencingDataHybrid(option.value);
          }
        } else {
          setErrorSnackbar({
            open: true,
            message: "You don't have any registered devices. Please register a device."
          });
        }
      } catch (error) {
        console.error("Error fetching registered devices:", error);
        setErrorSnackbar({
          open: true,
          message: "Failed to fetch registered devices"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
  }, [GetRegisterdDevices]);

  useEffect(() => {
    // Set up polling for API-based devices and real-time listeners for Firebase devices
    const listeners = [];
    const pollingIntervals = [];

    if (deviceOptions.length > 0) {
      // Set up Firebase listeners
      const firebaseListeners = setupFirebaseListeners(deviceOptions);
      listeners.push(...firebaseListeners);
      
      // Set up polling for API-based devices
      deviceOptions.forEach(device => {
        const savedSource = deviceSources[device.value];
        
        // If device uses API or has no saved source yet, set up polling
        if (savedSource !== 'firebase') {
          const interval = setInterval(() => {
            if (device.value === selectedDevice) {
              fetchDeviceDataHybrid(device.value);
              fetchGeofencingDataHybrid(device.value);
            }
          }, 30000); // Poll every 30 seconds
          
          pollingIntervals.push(interval);
        }
      });
    }

    // Always fetch data for the selected device initially
    if (selectedDevice) {
      fetchDeviceDataHybrid(selectedDevice);
      fetchGeofencingDataHybrid(selectedDevice);
    }

    return () => {
      // Clean up listeners and intervals
      listeners.forEach(unsubscribe => unsubscribe());
      pollingIntervals.forEach(clearInterval);
    };
  }, [selectedDevice, deviceOptions]);

  useEffect(() => {
    if (mapRef.current && mapCenter.lat && mapCenter.lng) {
      mapRef.current.setView([mapCenter.lat, mapCenter.lng], 15);
    } else if (mapRef.current) {
      mapRef.current.setView([defaultLatLng.lat, defaultLatLng.lng], 5);
    }
  }, [mapCenter]);

  const handleShare = () => {
    const data = deviceData[selectedDevice];
    if (data?.found) {
      const googleMapsLink = `https://www.google.com/maps/place/${data.lat},${data.lng}`;
      window.open(googleMapsLink, "_blank");
    } else {
      setErrorSnackbar({
        open: true,
        message: "No location data available to share"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedDevice) return;
    
    try {
      await deleteRegesteredDevice(selectedDevice);
      const updatedOptions = deviceOptions.filter(d => d.value !== selectedDevice);
      setDeviceOptions(updatedOptions);
      
      // Clean up Firebase data for this device (optional)
      try {
        await remove(ref(database, selectedDevice));
      } catch (fbError) {
        console.log("No Firebase data to clean up or error:", fbError);
      }
      
      // Remove from device sources
      const newSources = { ...deviceSources };
      delete newSources[selectedDevice];
      setDeviceSources(newSources);
      localStorage.setItem("deviceDataSources", JSON.stringify(newSources));
      
      // If we deleted the last device or current selected device
      if (updatedOptions.length === 0) {
        setSelectedDeviceIndex(-1);
      } else if (selectedDeviceIndex >= updatedOptions.length) {
        setSelectedDeviceIndex(updatedOptions.length - 1);
      }
      
      setSuccessSnackbar({
        open: true,
        message: "Device deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting device:", error);
      setErrorSnackbar({
        open: true,
        message: "Failed to delete device"
      });
    }
  };

  const handleAddGeofencing = async () => {
    if (!selectedDevice) return;
    
    const data = deviceData[selectedDevice];
    if (data?.found) {
      try {
        const source = deviceSources[selectedDevice] || 'api';
        
        if (source === 'firebase') {
          // Add geofencing to Firebase
          await set(ref(database, `${selectedDevice}/geofencing`), {
            lat: data.lat,
            lng: data.lng,
            radius: 1 // Default radius
          });
        } else {
          // Add geofencing via API
          await addGeofencingDevice(selectedDevice, {
            lat: data.lat,
            lng: data.lng
          });
        }
  
        setSuccessSnackbar({
          open: true,
          message: "Geofencing coordinates added successfully"
        });

        setDeviceData((prev) => ({
          ...prev,
          [selectedDevice]: {
            ...prev[selectedDevice],
            geofencing: {
              lat: data.lat,
              lng: data.lng,
              radius: 1, // Default radius when creating a new geofence
            },
          }
        }));
        // Set default slider value for new geofence
        setSliderValue(1);
      } catch (error) {
        console.error("Error adding geofencing coordinates:", error);
        setErrorSnackbar({
          open: true,
          message: "Failed to add geofencing coordinates"
        });
      }
    } else {
      setErrorSnackbar({
        open: true,
        message: "Device location data is required to create a geofence"
      });
    }
  };
  
  const handleDeleteGeofencing = async () => {
    if (!selectedDevice) return;
    
    try {
      const source = deviceSources[selectedDevice] || 'api';
      
      if (source === 'firebase') {
        // Remove geofencing from Firebase
        await remove(ref(database, `${selectedDevice}/geofencing`));
      } else {
        // Remove geofencing via API
        await deleteGeofencingDevice(selectedDevice);
      }
      
      setSuccessSnackbar({
        open: true,
        message: "Geofencing coordinates deleted successfully"
      });

      setDeviceData((prev) => ({
        ...prev,
        [selectedDevice]: {
          ...prev[selectedDevice],
          geofencing: false,
        }
      }));
    } catch (error) {
      console.error("Error deleting geofencing coordinates:", error);
      setErrorSnackbar({
        open: true,
        message: "Failed to delete geofencing coordinates"
      });
    }
  };

  const refreshData = () => {
    if (selectedDevice) {
      toast.info("Refreshing device data...", { autoClose: 1000 });
      fetchDeviceDataHybrid(selectedDevice).then(success => {
        fetchGeofencingDataHybrid(selectedDevice).then(geoSuccess => {
          if (success || geoSuccess) {
            setSuccessSnackbar({
              open: true,
              message: "Device data refreshed successfully"
            });
          }
        });
      });
    }
  };

  // Toggle data source between Firebase and API
  const toggleDataSource = async () => {
    if (!selectedDevice) return;
    
    const currentSource = deviceSources[selectedDevice] || 'api';
    const newSource = currentSource === 'api' ? 'firebase' : 'api';
    
    // Update the data source
    setDeviceSources(prev => ({ 
      ...prev, 
      [selectedDevice]: newSource 
    }));
    
    // Refresh data using the new source
    setSuccessSnackbar({
      open: true,
      message: `Switched to ${newSource === 'firebase' ? 'Firebase' : 'API'} data source`
    });
    
    // Fetch data with the new source
    await fetchDeviceDataHybrid(selectedDevice);
    await fetchGeofencingDataHybrid(selectedDevice);
  };

  // Format the date from 2025-03-13 04:46:15 to Mar 13, 04:46 AM
  const formatTimeDisplay = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const [datePart, timePart] = dateTimeString.split(' ');
    if (!datePart || !timePart) return dateTimeString;
    
    const date = new Date(datePart + 'T' + timePart);
    if (isNaN(date)) return dateTimeString;
    
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString('en-US', options);
  };

  // Handlers for snackbar close
  const handleErrorSnackbarClose = () => {
    setErrorSnackbar({ open: false, message: "" });
  };
  
  const handleSuccessSnackbarClose = () => {
    setSuccessSnackbar({ open: false, message: "" });
  };

  if (loading) {
    return (
      <Layout title={"Dmarg - Live"}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            {/* Navigation Skeleton */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item>
                  <Skeleton variant="circular" width={40} height={40} />
                </Grid>
                <Grid item>
                  <Skeleton variant="text" width={100} height={40} />
                </Grid>
                <Grid item>
                  <Skeleton variant="circular" width={40} height={40} />
                </Grid>
                <Grid item xs>
                  <Skeleton variant="text" height={40} />
                </Grid>
              </Grid>
            </Box>
  
            {/* Main Content Skeleton */}
            <Grid container spacing={2} sx={{ p: 2 }}>
              {/* Map Area Skeleton */}
              <Grid item xs={12} md={8}>
                <Skeleton 
                  variant="rectangular" 
                  height={isMobile ? 300 : 500} 
                  sx={{ 
                    borderRadius: 2,
                    aspectRatio: isMobile ? '1' : '2/1'
                  }} 
                />
              </Grid>
  
              {/* Info Panel Skeleton */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Data Source Skeleton */}
                  <Skeleton 
                    variant="rectangular" 
                    height={40} 
                    sx={{ borderRadius: 1 }} 
                  />
  
                  {/* Device Status Skeleton */}
                  <Skeleton 
                    variant="rounded" 
                    height={120} 
                    sx={{ borderRadius: 2 }} 
                  />
  
                  {/* Geofence Settings Skeleton */}
                  <Skeleton 
                    variant="rounded" 
                    height={200} 
                    sx={{ borderRadius: 2 }} 
                  />
  
                  {/* Action Buttons Skeleton */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton 
                      variant="rounded" 
                      width="100%" 
                      height={40} 
                    />
                    <Skeleton 
                      variant="rounded" 
                      width="100%" 
                      height={40} 
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Layout>
    );
  }
  return (
    <Layout title={"Dmarg - Live Tracking"}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Fade in={!loading}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative'
          }}>
            {/* Data source indicator */}
            {dataSourceInfo.visible && selectedDevice && deviceSources[selectedDevice] && (
              <DataSourceSwitch
                visible={dataSourceInfo.visible}
                message={dataSourceInfo.message}
                source={deviceSources[selectedDevice]}
                onToggle={toggleDataSource}
              />
            )}
            
            {/* Device Navigation Component */}
            <DeviceNavigation
              currentDeviceLabel={currentDeviceLabel}
              deviceOptions={deviceOptions}
              selectedDeviceIndex={selectedDeviceIndex}
              goToPreviousDevice={goToPreviousDevice}
              goToNextDevice={goToNextDevice}
              onDeviceSelect={handleDeviceSelect}
              deviceStatus={deviceData[selectedDevice]}
            />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              bgcolor: '#f5f5f5',
              overflow: 'hidden',
              p: { xs: 1, md: 2 }
            }}>
              {/* Main Content Grid */}
              <Grid container spacing={2}>
                {/* Map Area - Full width on mobile, 2/3 on desktop */}
                <Grid item xs={12} md={8}>
                  <MapView
                    mapRef={mapRef}
                    mapCenter={mapCenter}
                    selectedDevice={selectedDevice}
                    deviceData={deviceData}
                    currentDeviceLabel={currentDeviceLabel}
                    isMobile={isMobile}
                    refreshData={refreshData}
                    handleShare={handleShare}
                    defaultLatLng={defaultLatLng}
                  />
                </Grid>
                
                {/* Device Info Area - Full width on mobile, 1/3 on desktop */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Data Source Switch Button */}
                    {selectedDevice && deviceSources[selectedDevice] && (
                      <Button
                        variant="outlined"
                        fullWidth
                        size="small"
                        color={deviceSources[selectedDevice] === 'firebase' ? "secondary" : "primary"}
                        startIcon={deviceSources[selectedDevice] === 'firebase' ? <StorageIcon /> : <CloudIcon />}
                        onClick={toggleDataSource}
                        sx={{ mb: 2, borderRadius: 2 }}
                      >
                        Data Source: {deviceSources[selectedDevice] === 'firebase' ? "Firebase Realtime" : "API"}
                      </Button>
                    )}
                    
                    {/* Device Status Card */}
                    {selectedDevice && deviceData[selectedDevice] && (
                      <DeviceStatusCard
                        selectedDevice={selectedDevice}
                        deviceData={deviceData}
                        formatTimeDisplay={formatTimeDisplay}
                      />
                    )}
                    
                    {/* Geofence Settings */}
                    {selectedDevice && deviceData[selectedDevice]?.geofencing && (
                      <GeofenceSettings
                        selectedDevice={selectedDevice}
                        deviceData={deviceData}
                        sliderValue={sliderValue}
                        handleSliderChange={handleSliderChange}
                        handleSliderCommit={handleSliderCommit}
                      />
                    )}
                    
                    {/* Action Buttons */}
                    {selectedDevice && (
                      <ActionButtons
                        selectedDevice={selectedDevice}
                        deviceData={deviceData}
                        handleAddGeofencing={handleAddGeofencing}
                        handleDeleteGeofencing={handleDeleteGeofencing}
                        handleDelete={handleDelete}
                      />
                    )}
                    
                    {/* Empty or no device message */}
                    {deviceOptions.length === 0 && (
                      <NoDeviceMessage />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Fade>
        
        {/* Success Snackbar */}
        <Snackbar 
          open={successSnackbar.open} 
          autoHideDuration={4000} 
          onClose={handleSuccessSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSuccessSnackbarClose} 
            severity="success" 
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {successSnackbar.message}
          </Alert>
        </Snackbar>
        
        {/* Error Snackbar */}
        <Snackbar 
          open={errorSnackbar.open} 
          autoHideDuration={4000} 
          onClose={handleErrorSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleErrorSnackbarClose} 
            severity="error" 
            variant="filled" 
            sx={{ width: '100%' }}
          >
            {errorSnackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}