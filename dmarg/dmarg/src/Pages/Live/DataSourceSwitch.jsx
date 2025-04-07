import React from 'react';
import { Box, Chip, Fade, Tooltip } from '@mui/material';
import { 
  CloudQueue as CloudIcon, 
  Storage as StorageIcon,
  SwapHoriz as SwapIcon 
} from '@mui/icons-material';

/**
 * Component that displays the current data source (Firebase or API)
 * and provides a way to toggle between them
 * 
 * @param {boolean} visible - Whether the component should be visible
 * @param {string} message - The message to display
 * @param {string} source - The current data source ('firebase' or 'api')
 * @param {function} onToggle - Function to call when toggling the source
 */
const DataSourceSwitch = ({ visible, message, source, onToggle }) => {
  return (
    <Fade in={visible}>
      <Box sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1200,
      }}>
        <Tooltip title={`Click to switch to ${source === 'firebase' ? 'API' : 'Firebase'} data source`}>
          <Chip
            icon={source === 'firebase' ? <StorageIcon /> : <CloudIcon />}
            label={message}
            color={source === 'firebase' ? "secondary" : "primary"}
            variant="outlined"
            onClick={onToggle}
            deleteIcon={<SwapIcon />}
            onDelete={onToggle}
            size="small"
            sx={{ 
              boxShadow: 1,
              '&:hover': {
                backgroundColor: source === 'firebase' ? 'secondary.light' : 'primary.light',
                '& .MuiChip-label, & .MuiChip-icon, & .MuiChip-deleteIcon': {
                  color: 'white'
                }
              },
              transition: 'all 0.2s ease',
              pl: 0.5
            }}
          />
        </Tooltip>
      </Box>
    </Fade>
  );
};

export default DataSourceSwitch;