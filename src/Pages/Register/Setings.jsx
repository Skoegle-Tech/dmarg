import {
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  DevicesOther as DeviceIcon
} from "@mui/icons-material";
import { useState } from "react";
import Layout from "../../Layout/Layout";
import { toast } from "react-toastify";
import QRCodeScanner from "./QRCodeScanning";
import ManualEntryForm from "./ManualEntryForm";
import NicknameDialog from "./NicknameDialog";
import InfoCard from "./InfoCard";
import { useStore } from "../../Store/Store";

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function RegisterDevice() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addDevice, logRealtimeData } = useStore();
  
  // State variables
  const [deviceName, setDeviceName] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [custommerId] = useState(localStorage.getItem("custommerid"));
  const [success, setSuccess] = useState(false);
  const [openNicknameDialog, setOpenNicknameDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [loadingStep, setLoadingStep] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState({});

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle QR scan success
  const handleScanSuccess = (scannedDeviceName, scannedDeviceCode) => {
    setDeviceName(scannedDeviceName);
    setDeviceCode(scannedDeviceCode.trim());
    setOpenNicknameDialog(true);
    showNotification("QR code scanned successfully!", "success");
  };

  // Handle manual form submission
  const handleManualFormSubmit = async (deviceData) => {
    setDeviceName(deviceData.deviceName);
    setDeviceCode(deviceData.deviceCode);
    setNickname(deviceData.nickname);
    await registerDevice();
  };

  // Register device with server
  const registerDevice = async () => {
    if (!nickname) {
      showNotification("Nickname is required", "error");
      return;
    }

    try {
      setLoadingStep("Validating device...");
      const cleanedDeviceCode = deviceCode.replace(/\n/g, "");
      
      // Use store functions instead of direct axios calls
      await addDevice(deviceName, cleanedDeviceCode, custommerId, nickname);

      setLoadingStep("Registering device with your customer ID...");
      // // Sample coordinates - in a production app, you might want to get actual location
      // await logRealtimeData(
      //   deviceName, 
      //   37.7749,  // latitude
      //   -122.4194, // longitude
      //   "06-02-2025", // date
      //   "14:30:00"  // time
      // );

      setLoadingStep("Adding device...");
      setSuccess(true);
      showNotification("Device registered successfully!", "success");
      resetForm();
      
      // Navigate to home page after registration
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      showNotification("Failed to register the device. Please try again.", "error");
    } finally {
      setLoadingStep(null);
      setOpenNicknameDialog(false);
    }
  };

  // Reset form state
  const resetForm = () => {
    setDeviceName("");
    setDeviceCode("");
    setNickname("");
  };

  // Handle nickname dialog submission
  const handleNicknameSubmit = async () => {
    await registerDevice();
  };

  // Show notification snackbar
  const showNotification = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };
  
  // Handle nickname input change
  const handleNicknameChange = (value) => {
    setNickname(value);
  };

  return (
    <Layout title={"Vmarg - Register Device"}>
      <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 2, 
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header */}
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DeviceIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h5" component="h1">
              Device Registration
            </Typography>
          </Box>
          
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Tab 
              icon={<QrCodeIcon />} 
              label="Scan QR Code" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<EditIcon />} 
              label="Manual Entry" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
          </Tabs>
          
          {/* Tab Contents */}
          <Box sx={{ p: 3 }}>
            {/* QR Code Scanner Tab */}
            <TabPanel value={activeTab} index={0}>
              <QRCodeScanner 
                onScanSuccess={handleScanSuccess}
                onError={(msg) => showNotification(msg, "error")}
                onWarning={(msg) => showNotification(msg, "warning")}
                onTabChange={() => handleTabChange(null, 1)}
                isActive={activeTab === 0}
              />
            </TabPanel>
            
            {/* Manual Entry Tab */}
            <TabPanel value={activeTab} index={1}>
              <ManualEntryForm 
                onSubmit={handleManualFormSubmit}
                loadingStep={loadingStep}
                isActive={activeTab === 1}
              />
            </TabPanel>
          </Box>
        </Paper>
        
        {/* Help Info Card */}
        <InfoCard />
      </Container>

      {/* Nickname Dialog */}
      <NicknameDialog 
        open={openNicknameDialog}
        onClose={() => setOpenNicknameDialog(false)}
        deviceName={deviceName}
        deviceCode={deviceCode}
        nickname={nickname}
        onNicknameChange={handleNicknameChange}
        onSubmit={handleNicknameSubmit}
        loadingStep={loadingStep}
        errors={errors}
      />

      {/* Snackbar notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
}