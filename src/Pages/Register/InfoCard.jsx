import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

const InfoCard = () => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mt: 3, 
        p: 2, 
        bgcolor: 'info.light', 
        color: 'info.contrastText',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <InfoIcon sx={{ mr: 1.5, mt: 0.3 }} />
        <Typography variant="body2">
          <strong>Need help?</strong> Make sure you have the device powered on and the QR code is clearly visible. 
          For manual registration, the device code can be found on the label or in documentation. If you're having trouble, 
          please contact support at info@skoegle.in.
        </Typography>
      </Box>
    </Paper>
  );
};

export default InfoCard;