import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Fade
} from "@mui/material";
import {
  DevicesOther as DeviceIcon,
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  SaveAlt as SaveIcon,
  Help as HelpIcon
} from "@mui/icons-material";

const ManualEntryForm = ({ onSubmit, loadingStep, isActive }) => {
  const [deviceName, setDeviceName] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState({});

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'deviceName') setDeviceName(value);
    if (name === 'deviceCode') setDeviceCode(value);
    if (name === 'nickname') setNickname(value);
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({...errors, [name]: null});
    }
  };

  
  // Validate form fields
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;
    
    if (!deviceName) {
      tempErrors.deviceName = "Device name is required";
      isValid = false;
    }
    
    if (!deviceCode) {
      tempErrors.deviceCode = "Device code is required";
      isValid = false;
    }
    
    if (deviceCode.length !== 16) {
      tempErrors.deviceCode = "Device code must be exactly 16 characters";
      isValid = false;
    }

    
    if (!nickname) {
      tempErrors.nickname = "Nickname is required";
      isValid = false;
    } 
    
    if (nickname.length < 5) {
      tempErrors.nickname = "Nickname must be at least 5 characters long";
      isValid = false;
    }
    
    setErrors(tempErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ deviceName, deviceCode, nickname });
    }
  };

  return (
    <Fade in={isActive}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h6" gutterBottom>
          Enter Device Details
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please enter the device information exactly as it appears on your device or packaging
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="deviceName"
              label="Device Name"
              value={deviceName}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              error={!!errors.deviceName}
              helperText={errors.deviceName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DeviceIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: deviceName && (
                  <InputAdornment position="end">
                    <Tooltip title="Device name is typically found on the label">
                      <HelpIcon color="action" fontSize="small" />
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="deviceCode"
              label="Device Code"
              value={deviceCode}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              error={!!errors.deviceCode}
              helperText={errors.deviceCode}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: deviceCode && (
                  <InputAdornment position="end">
                    <Tooltip title="Device code is a unique identifier printed on your device">
                      <HelpIcon color="action" fontSize="small" />
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="nickname"
              label="Device Nickname (Custom Name)"
              value={nickname}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
              error={!!errors.nickname}
              helperText={errors.nickname || "Choose a name you'll recognize easily"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>
        
        {loadingStep && (
          <Box sx={{ mt: 3 }}>
            <LinearProgress color="primary" />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              {loadingStep}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loadingStep !== null}
            startIcon={loadingStep ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 8,
              bgcolor: '#00796b',
              '&:hover': { bgcolor: '#00635a' }
            }}
          >
            {loadingStep ? "Registering..." : "Register Device"}
          </Button>
        </Box>
      </Box>
    </Fade>
  );
};

export default ManualEntryForm;