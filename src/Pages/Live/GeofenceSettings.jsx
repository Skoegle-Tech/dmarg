import React from 'react';
import {
  Card, CardContent, Box, Typography, Divider, Slider,
  Grid, useTheme, LinearProgress, Paper, Tooltip
} from '@mui/material';
import {
  Adjust as AdjustIcon,
  Battery90 as BatteryIcon,
  ElectricBolt as MainIcon,
  LocationOn as LocationOnIcon,
  FmdGood as HomeIcon
} from '@mui/icons-material';

const GeofenceSettings = ({
  selectedDevice,
  deviceData,
  sliderValue,
  handleSliderChange,
  handleSliderCommit
}) => {
  const theme = useTheme();

  if (!selectedDevice || !deviceData[selectedDevice]?.geofencing) {
    return null;
  }
  
  // Convert voltage to battery percentage
  const getBatteryPercentage = (voltage) => {
    if (!voltage) return 0;
    
    // Assuming voltage range from 3.0V to 4.2V for a typical lithium battery
    const minVoltage = 3.0;
    const maxVoltage = 4.2;
    const v = parseFloat(voltage);
    
    if (v <= minVoltage) return 0;
    if (v >= maxVoltage) return 100;
    
    // Linear approximation
    return Math.round(((v - minVoltage) / (maxVoltage - minVoltage)) * 100);
  };
  
  const batteryPercentage = getBatteryPercentage(deviceData[selectedDevice]?.geofencing?.battery);
  
  // Get battery color based on percentage
  const getBatteryColor = (percentage) => {
    if (percentage <= 20) return theme.palette.error.main;
    if (percentage <= 50) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  const batteryColor = getBatteryColor(batteryPercentage);
  
  return (
    <Card sx={{ 
      mt: 2,
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)'
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
            <HomeIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: theme.palette.secondary.main,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              Geofence Settings
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {/* System Status */}
          <Grid item xs={12}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1.5, 
                borderRadius: 1.5, 
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                System Status
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <MainIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ mr: 0.5 }}>Main:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {deviceData[selectedDevice]?.geofencing?.main || "N/A"} V
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <BatteryIcon fontSize="small" sx={{ mr: 1, color: batteryColor }} />
                      <Typography variant="body2" sx={{ mr: 0.5 }}>Battery:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {deviceData[selectedDevice]?.geofencing?.battery || "N/A"} V
                      </Typography>
                    </Box>
                    <Tooltip title={`${batteryPercentage}% Battery`} placement="bottom-start">
                      <LinearProgress 
                        variant="determinate" 
                        value={batteryPercentage} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: theme.palette.grey[300],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: batteryColor
                          }
                        }} 
                      />
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Geofence Location */}
          <Grid item xs={12}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1.5, 
                borderRadius: 1.5, 
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Home Location
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ mr: 0.5 }}>Lat:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {deviceData[selectedDevice]?.geofencing?.lat?.toFixed(6) || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ mr: 0.5 }}>Long:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {deviceData[selectedDevice]?.geofencing?.lng?.toFixed(6) || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Radius Slider */}
          <Grid item xs={12}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1.5, 
                borderRadius: 1.5, 
                bgcolor: 'background.default'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Geofence Radius
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="secondary">
                  {sliderValue} km
                </Typography>
              </Box>
              
              <Box sx={{ px: 1 }}>
                <Slider
                  value={sliderValue}
                  onChange={handleSliderChange}
                  onChangeCommitted={handleSliderCommit}
                  valueLabelDisplay="auto"
                  step={0.1}
                  marks={[
                    { value: 0.05, label: '50m' },
                    { value: 5, label: '5km' },
                    { value: 10, label: '10km' }
                  ]}
                  min={0.05}
                  max={10}
                  aria-labelledby="geofence-radius-slider"
                  color="secondary"
                  sx={{
                    '& .MuiSlider-thumb': {
                      height: 24,
                      width: 24,
                      backgroundColor: '#fff',
                      border: '2px solid currentColor',
                      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                        boxShadow: 'inherit',
                      },
                      '&:before': {
                        display: 'none',
                      },
                    },
                    '& .MuiSlider-track': {
                      height: 4,
                      borderRadius: 2,
                    },
                    '& .MuiSlider-rail': {
                      height: 4,
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Adjust the radius to set how far from home the device can travel before triggering an alert.
                  Smaller values for more precision, larger values for more flexibility.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GeofenceSettings;