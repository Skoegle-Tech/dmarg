import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  CircularProgress,
  IconButton
} from "@mui/material";
import {
  QrCode as QrCodeIcon,
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import Webcam from "react-webcam";
import jsQR from "jsqr";

const QRCodeScanner = ({ onScanSuccess, onError, onWarning, onTabChange, isActive }) => {
  const [openCamera, setOpenCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [scanAnimation, setScanAnimation] = useState(false);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Initialize camera on component mount
  useEffect(() => {
    if (isActive) {
      const checkCameraPermission = async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraPermission(true);
          await loadCameras();
        } catch (err) {
          console.error("Camera permission denied:", err);
          setCameraPermission(false);
          onWarning("Camera access is required for QR scanning");
        }
      };
      
      checkCameraPermission();
    }
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isActive, onWarning]);
  
  // Load available cameras
  const loadCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      
      setDevicesLoaded(true);
    } catch (err) {
      console.error("Error loading cameras:", err);
    }
  };

  const handleOpenCamera = async () => {
    if (cameraPermission) {
      setOpenCamera(true);
      setScanAnimation(true);
      setTimeout(() => {
        scanBarcode();
      }, 1000);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
        await loadCameras();
        setOpenCamera(true);
        setScanAnimation(true);
        setTimeout(() => {
          scanBarcode();
        }, 1000);
      } catch (err) {
        setCameraPermission(false);
        onError("Camera access denied. Please enable camera access in your browser settings.");
      }
    }
  };

  const scanBarcode = useCallback(() => {
    setScanning(true);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    
    scanIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc && canvasRef.current) {
          const image = new Image();
          image.src = imageSrc;
          image.onload = () => {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
              try {
                // Clear the scanning interval
                if (scanIntervalRef.current) {
                  clearInterval(scanIntervalRef.current);
                }
                
                const [scannedDeviceName, scannedDeviceCode] = code.data.split(",");
                if (scannedDeviceName && scannedDeviceCode) {
                  setOpenCamera(false);
                  setScanning(false);
                  setScanAnimation(false);
                  onScanSuccess(scannedDeviceName, scannedDeviceCode);
                } else {
                  throw new Error("Invalid QR code format");
                }
              } catch (error) {
                onError("Invalid QR code format. Please try again.");
                
                // Continue scanning
                scanBarcode();
              }
            }
          };
        }
      }
    }, 500); // Scan every 500ms
    
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [onError, onScanSuccess]);

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setScanning(false);
    setScanAnimation(false);
    setOpenCamera(false);
  };
  
  const switchCamera = () => {
    if (availableCameras.length <= 1) return;
    
    const currentIndex = availableCameras.findIndex(camera => camera.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % availableCameras.length;
    setSelectedCamera(availableCameras[nextIndex].deviceId);
  };

  return (
    <Box sx={{ textAlign: "center", mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Scan Device QR Code
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Position your device's QR code within the scanner frame
      </Typography>
      
      {cameraPermission === false && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            bgcolor: 'error.light', 
            color: 'error.contrastText',
            borderRadius: 2,
            mb: 2
          }}
        >
          <Typography variant="body1" sx={{ mb: 1 }}>
            Camera access is required for QR scanning
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenCamera}
            sx={{ mt: 1 }}
          >
            Enable Camera
          </Button>
        </Paper>
      )}
      
      {openCamera ? (
        <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              border: '2px solid white',
              borderRadius: 2,
              boxShadow: scanAnimation ? '0px 0px 10px 3px rgba(0,255,0,0.5)' : 'none',
              pointerEvents: 'none',
              transition: 'all 0.5s ease',
            }}
          >
            {/* QR frame corners */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '3px solid #00796b', borderLeft: '3px solid #00796b' }} />
            <Box sx={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTop: '3px solid #00796b', borderRight: '3px solid #00796b' }} />
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottom: '3px solid #00796b', borderLeft: '3px solid #00796b' }} />
            <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottom: '3px solid #00796b', borderRight: '3px solid #00796b' }} />
            
            {scanAnimation && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(to right, transparent, #00796b, transparent)',
                  animation: 'scan-line 2s ease-in-out infinite',
                  '@keyframes scan-line': {
                    '0%': { top: '0%' },
                    '50%': { top: 'calc(100% - 4px)' },
                    '100%': { top: '0%' },
                  },
                }}
              />
            )}
          </Box>
          
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
              facingMode: { ideal: "environment" },
              width: { ideal: 720 },
              height: { ideal: 720 }
            }}
            style={{ 
              width: '100%', 
              borderRadius: 8,
              maxHeight: '400px',
              objectFit: 'cover' 
            }}
          />
          
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          {/* Camera controls */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 2,
            mt: 2
          }}>
            {availableCameras.length > 1 && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={switchCamera}
                startIcon={<CameraIcon />}
              >
                Switch Camera
              </Button>
            )}
            
            <Button 
              variant="outlined" 
              color="error"
              onClick={stopScanning}
              startIcon={<CloseIcon />}
            >
              Stop Scan
            </Button>
          </Box>
        </Box>
      ) : (
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            bgcolor: 'background.default',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            mb: 3
          }}
        >
          <QrCodeIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Camera is not active
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenCamera}
            startIcon={<CameraIcon />}
            sx={{ mt: 2 }}
          >
            Start Scanning
          </Button>
        </Box>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Can't scan? Switch to manual entry mode
        </Typography>
        <Button 
          variant="text" 
          color="primary"
          onClick={onTabChange}
        >
          Enter Device Details Manually
        </Button>
      </Box>
    </Box>
  );
};

export default QRCodeScanner;