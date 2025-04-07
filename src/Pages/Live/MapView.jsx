import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  Box, Typography, Fab, Tooltip, Chip, useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Map as MapIcon,
  GpsFixed as GpsFixedIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Custom marker icons
const createDeviceIcon = () => {
  return new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const createHomeIcon = () => {
  return new L.DivIcon({
    html: `<div style="
      background-color: #E91E63; 
      width: 12px; 
      height: 12px; 
      border-radius: 50%; 
      border: 3px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.5);"
    ></div>`,
    className: 'home-icon',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

// MapUpdater component to programmatically update map view
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], zoom || 15, {
        animate: true,
        duration: 1
      });
    }
  }, [center, map, zoom]);
  
  return null;
};

const MapView = ({ 
  mapRef, 
  mapCenter, 
  selectedDevice, 
  deviceData, 
  currentDeviceLabel, 
  isMobile, 
  refreshData, 
  handleShare,
  defaultLatLng
}) => {
  const theme = useTheme();
  const deviceIcon = createDeviceIcon();
  const homeIcon = createHomeIcon();
  
  // Format location data for display
  const formatCoordinate = (coord) => {
    return coord ? parseFloat(coord).toFixed(6) : "N/A";
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    if (isNaN(date)) return timestamp;
    return date.toLocaleString();
  };

  // Determine if we have valid location and geofencing data
  const hasDeviceData = selectedDevice && deviceData[selectedDevice]?.found;
  const hasGeofenceData = selectedDevice && deviceData[selectedDevice]?.geofencing;
  
  return (
    <Box sx={{
      position: 'relative',
      width: '100%', 
      height: isMobile ? '55vh' : '65vh',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      bgcolor: 'background.paper'
    }}>
      <Box 
        component={MapContainer}
        center={hasDeviceData ? [deviceData[selectedDevice].lat, deviceData[selectedDevice].lng] : defaultLatLng}
        zoom={hasDeviceData ? 15 : 5}
        ref={mapRef}
        sx={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '4px',
          '.leaflet-container': {
            width: '100% !important',
            height: '100% !important',
            zIndex: 0,
          },
          '.leaflet-control-container': {
            zIndex: 1,
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Current location marker */}
        {hasDeviceData && (
          <Marker 
            position={[deviceData[selectedDevice].lat, deviceData[selectedDevice].lng]} 
            icon={deviceIcon}
          >
            <Popup>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                {currentDeviceLabel}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  size="small" 
                  icon={<GpsFixedIcon />} 
                  label="Current Location" 
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              </Box>
              <Typography variant="body2">Latitude: {formatCoordinate(deviceData[selectedDevice].lat)}</Typography>
              <Typography variant="body2">Longitude: {formatCoordinate(deviceData[selectedDevice].lng)}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Last Updated: {formatTimestamp(deviceData[selectedDevice].lastUpdated)}
              </Typography>
            </Popup>
          </Marker>
        )}
        
        {/* Geofence circle and marker */}
        {hasGeofenceData && (
          <>
            <Circle
              center={[deviceData[selectedDevice].geofencing.lat, deviceData[selectedDevice].geofencing.lng]}
              radius={deviceData[selectedDevice].geofencing.radius * 1000}
              pathOptions={{ 
                color: '#e91e63',
                fillColor: '#e91e63',
                fillOpacity: 0.15
              }}
            />
            <Marker
              position={[deviceData[selectedDevice].geofencing.lat, deviceData[selectedDevice].geofencing.lng]} 
              icon={homeIcon}
            >
              <Popup>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                  Home Location
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    size="small" 
                    icon={<HomeIcon />} 
                    label="Geofence Center" 
                    color="secondary" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                </Box>
                <Typography variant="body2">Latitude: {formatCoordinate(deviceData[selectedDevice].geofencing.lat)}</Typography>
                <Typography variant="body2">Longitude: {formatCoordinate(deviceData[selectedDevice].geofencing.lng)}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Radius: {deviceData[selectedDevice].geofencing.radius} km
                </Typography>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Map updater component */}
        <MapUpdater 
          center={hasDeviceData ? 
            { lat: deviceData[selectedDevice].lat, lng: deviceData[selectedDevice].lng } : 
            defaultLatLng
          } 
          zoom={hasDeviceData ? 15 : 5}
        />
      </Box>

      {/* FAB Controls */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 500 }}>
        <Tooltip title="Refresh Data" placement="left">
          <Fab 
            color="primary"
            aria-label="refresh"
            size="medium"
            onClick={refreshData}
            sx={{ boxShadow: 3 }}
          >
            <RefreshIcon />
          </Fab>
        </Tooltip>
      </Box>
      
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 500 }}>
        <Tooltip title="Open in Google Maps" placement="right">
          <Fab 
            color="secondary"
            aria-label="view on maps"
            size="medium"
            onClick={handleShare}
            disabled={!hasDeviceData}
            sx={{ boxShadow: 3 }}
          >
            <MapIcon />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default MapView;