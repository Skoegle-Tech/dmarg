import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  CircularProgress
} from "@mui/material";
import {
  Close as CloseIcon,
  DevicesOther as DeviceIcon,
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  SaveAlt as SaveIcon
} from "@mui/icons-material";

const NicknameDialog = ({ 
  open, 
  onClose, 
  deviceName, 
  deviceCode, 
  nickname, 
  onNicknameChange, 
  onSubmit, 
  loadingStep, 
  errors 
}) => {
  // Handle enter key press for form submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && nickname.trim() && !loadingStep) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loadingStep ? undefined : onClose}
      fullWidth 
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DeviceIcon sx={{ mr: 1 }} />
          Device Successfully Scanned
        </Box>
        {!loadingStep && (
          <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="success.dark" fontWeight="medium">
              QR Code Detected
            </Typography>
          </Box>
          <Typography variant="body2">
            We've successfully detected your device. Now, give it a name you'll recognize.
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField 
              label="Device Name" 
              value={deviceName} 
              margin="normal" 
              fullWidth
              disabled 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DeviceIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField 
              label="Device Code" 
              value={deviceCode} 
              margin="normal" 
              fullWidth
              disabled 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Device Nickname"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              onKeyPress={handleKeyPress}
              margin="normal"
              fullWidth
              required
              autoFocus
              disabled={loadingStep !== null}
              error={!nickname && errors.nickname}
              helperText={!nickname && errors.nickname ? errors.nickname : "Choose a name you'll recognize easily"}
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
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              {loadingStep}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          startIcon={<CloseIcon />}
          disabled={loadingStep !== null}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained"
          disabled={loadingStep !== null || !nickname.trim()}
          startIcon={loadingStep ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ bgcolor: '#00796b', '&:hover': { bgcolor: '#00635a' } }}
        >
          {loadingStep ? "Registering..." : "Register Device"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NicknameDialog;