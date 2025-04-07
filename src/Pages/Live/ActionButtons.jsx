import React from 'react';
import { Button, CardActions, Box, useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const ActionButtons = ({
  selectedDevice,
  deviceData,
  handleAddGeofencing,
  handleDeleteGeofencing,
  handleDelete
}) => {
  const theme = useTheme();
  
  return (
    <CardActions sx={{ 
      p: 2, 
      display: 'flex', 
      justifyContent: 'space-between', 
      flexWrap: 'wrap', 
      gap: 1 
    }}>
      {!deviceData[selectedDevice]?.geofencing ? (
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          color="success"
          onClick={handleAddGeofencing}
          disabled={!deviceData[selectedDevice]?.found}
          sx={{ 
            flex: '1 0 auto', 
            minWidth: '140px',
            py: 1,
            fontWeight: 'bold',
            boxShadow: 2
          }}
        >
          Add Geofence
        </Button>
      ) : (
        <Button 
          variant="contained" 
          startIcon={<CancelIcon />}
          color="warning"
          onClick={handleDeleteGeofencing}
          sx={{ 
            flex: '1 0 auto', 
            minWidth: '140px',
            py: 1,
            fontWeight: 'bold',
            boxShadow: 2
          }}
        >
          Remove Geofence
        </Button>
      )}
      
      <Button 
        variant="contained" 
        startIcon={<DeleteIcon />}
        color="error"
        onClick={handleDelete}
        sx={{ 
          flex: '1 0 auto', 
          minWidth: '140px',
          py: 1,
          fontWeight: 'bold',
          boxShadow: 2
        }}
      >
        Delete Device
      </Button>
    </CardActions>
  );
};

export default ActionButtons;