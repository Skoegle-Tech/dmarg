import React from 'react';
import {
  Card, CardContent, Box, Typography, Divider, Chip,
  Grid, useTheme, Avatar, LinearProgress
} from '@mui/material';
import {
  SignalCellular4Bar as SignalIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Battery90 as BatteryIcon,
  ElectricBolt as MainIcon
} from '@mui/icons-material';

const DeviceStatusCard = ({ 
  selectedDevice, 
  deviceData, 
  formatTimeDisplay 
}) => {
  const theme = useTheme();
  
  if (!selectedDevice || !deviceData[selectedDevice]) {
    return null;
  }
  
  // Calculate time difference from now
  const getTimeSinceUpdate = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const [datePart, timePart] = dateTimeString.split(' ');
    if (!datePart || !timePart) return "N/A";
    
    const date = new Date(datePart + 'T' + timePart);
    if (isNaN(date)) return "N/A";
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  const timeSinceUpdate = deviceData[selectedDevice]?.lastUpdated ? 
    getTimeSinceUpdate(deviceData[selectedDevice]?.lastUpdated) : "N/A";
  
  return (
    <Card sx={{ 
      borderRadius: 2,
      boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
      overflow: 'visible'
    }}
    elevation={1}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1.5 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                mr: 1.5,
              }}
            >
              <SignalIcon />
            </Avatar>
            <Typography variant="h6" component="h2" sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.text.primary,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              Device Status
            </Typography>
          </Box>
          
          {deviceData[selectedDevice]?.found && (
            <Chip 
              icon={<AccessTimeIcon />} 
              label={timeSinceUpdate}
              color={
                timeSinceUpdate.includes("minute") ? "success" :
                timeSinceUpdate.includes("hour") ? "warning" : "error"
              }
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {deviceData[selectedDevice]?.found === false ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            py: 3,
            bgcolor: 'error.light',
            borderRadius: 1,
          }}>
            <SignalIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" color="error" align="center" sx={{ fontWeight: 'medium' }}>
              Device not reporting any location data.
            </Typography>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
              The device may be offline or in an area with no signal.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Latitude
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }} noWrap>
                    {deviceData[selectedDevice]?.lat?.toFixed(6) ?? "Loading..."}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={6}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Longitude
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }} noWrap>
                    {deviceData[selectedDevice]?.lng?.toFixed(6) ?? "Loading..."}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Last Updated
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {formatTimeDisplay(deviceData[selectedDevice]?.lastUpdated) ?? "Waiting..."}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceStatusCard;