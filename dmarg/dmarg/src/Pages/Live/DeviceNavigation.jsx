import React from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Badge, 
  useTheme, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText,
  Zoom
} from '@mui/material';
import {
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  LocationOn as LocationOnIcon,
  DevicesOther as DeviceIcon,
  FiberManualRecord as StatusIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const DeviceNavigation = ({ 
  currentDeviceLabel, 
  deviceOptions, 
  selectedDeviceIndex, 
  goToPreviousDevice, 
  goToNextDevice,
  deviceStatus,
  onDeviceSelect
}) => {
  const theme = useTheme();
  const [deviceMenuAnchor, setDeviceMenuAnchor] = React.useState(null);

  const handleDeviceMenuOpen = (event) => {
    setDeviceMenuAnchor(event.currentTarget);
  };

  const handleDeviceMenuClose = () => {
    setDeviceMenuAnchor(null);
  };

  const handleDeviceSelect = (index) => {
    onDeviceSelect(index);
    handleDeviceMenuClose();
  };

  // Get device status - online if location updated in the last hour
  const getStatusColor = (device) => {
    if (!device) return "error";
    
    // If we have device data and it was found
    if (deviceStatus && deviceStatus.found) {
      const lastUpdated = new Date(deviceStatus.lastUpdated);
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      return lastUpdated > oneHourAgo ? "success" : "warning";
    }
    return "error";
  };

  const statusColor = getStatusColor(deviceStatus);
  const deviceCount = deviceOptions.length;

  return (
    <AppBar 
      position="static" 
      sx={{ 
        borderRadius: '12px 12px 0 0', 
        mb: 0,
        background: 'linear-gradient(145deg, #1976d2, #1565c0)' 
      }}
      elevation={3}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 0.75 }}>
        <IconButton 
          edge="start" 
          color="inherit" 
          onClick={goToPreviousDevice}
          disabled={deviceOptions.length <= 1}
          sx={{
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            },
            transition: 'all 0.2s'
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Tooltip 
          title={deviceCount > 1 ? `Click to select from ${deviceCount} devices` : deviceCount === 0 ? "No devices registered" : "Your only registered device"} 
          arrow
        >
          <Box 
            onClick={deviceCount > 1 ? handleDeviceMenuOpen : undefined}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 1,
              borderRadius: 2,
              cursor: deviceCount > 1 ? 'pointer' : 'default',
              '&:hover': deviceCount > 1 ? { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              } : {},
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Zoom in={true}>
                  <StatusIcon 
                    sx={{ 
                      color: statusColor === "success" ? 'success.main' : 
                             statusColor === "warning" ? 'warning.main' : 'error.main',
                      fontSize: 12
                    }}
                  />
                </Zoom>
              }
            >
              <DeviceIcon sx={{ fontSize: 28, mr: 1 }} />
            </Badge>
            
            <Typography 
              variant="h6" 
              component="div" 
              noWrap
              sx={{ 
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                maxWidth: { xs: 170, sm: 250, md: 350 }
              }}
            >
              {currentDeviceLabel || "No Device"}
            </Typography>
          </Box>
        </Tooltip>
        
        <Menu
          anchorEl={deviceMenuAnchor}
          open={Boolean(deviceMenuAnchor)}
          onClose={handleDeviceMenuClose}
          sx={{ mt: 1 }}
        >
          {deviceOptions.map((device, index) => (
            <MenuItem 
              key={device.value} 
              onClick={() => handleDeviceSelect(index)}
              selected={index === selectedDeviceIndex}
              sx={{ minWidth: 200 }}
            >
              <ListItemIcon>
                <LocationOnIcon color={index === selectedDeviceIndex ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary={device.label} />
            </MenuItem>
          ))}
          <MenuItem 
            component={Link} 
            to="/settings"
            divider
            sx={{ color: 'primary.main' }}
          >
            <ListItemIcon>
              <AddIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Register New Device" />
          </MenuItem>
        </Menu>
        
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={goToNextDevice}
          disabled={deviceOptions.length <= 1}
          sx={{
            '&:hover': { 
              backgroundColor: 'rgba(255, 255, 255, 0.1)' 
            },
            transition: 'all 0.2s'
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default DeviceNavigation;