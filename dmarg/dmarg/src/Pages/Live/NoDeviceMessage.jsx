import React from 'react';
import { Paper, Typography, Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

/**
 * Component displayed when no devices are found
 * Prompts the user to register a new device
 */
const NoDeviceMessage = () => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mt: 2, 
        textAlign: 'center',
        bgcolor: '#f0f4f7',
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ mb: 2 }}>
        <img 
          src="/assets/no-devices.svg" 
          alt="No devices" 
          style={{ 
            width: '120px', 
            height: '120px',
            opacity: 0.7
          }} 
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No Devices Found
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        You don't have any registered devices yet. Register a device to start tracking.
      </Typography>
      <Button 
        component={Link} 
        to="/settings"
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        sx={{
          borderRadius: 2,
          py: 1,
          px: 3
        }}
      >
        Register Device
      </Button>
    </Paper>
  );
};

export default NoDeviceMessage;