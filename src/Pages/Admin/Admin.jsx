import { useState } from "react";
import Layout from "../../Layout/Layout";
import { Box, Snackbar, Alert } from "@mui/material";
import TabNavigation from "./TabNavigation";
import DeviceManagement from "./DeviceManagement";
import UserManagement from "./UserManagement";
import AddUserForm from "./AddUserForm";
import AdminProfile from "../../Layout/AdminProfile";
import AdminDashboard from "./AdminDashboard";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("devices");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
  };

  const showNotification = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Layout title="Admin Dashboard">
      <Box sx={{ 
        padding: { xs: 2, sm: 3, md: 4 },
        backgroundColor: "background.default",
        minHeight: "calc(100vh - 56px)"
      }}>
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        
        <Box sx={{ mt: 4 }}>
          {/* {activeTab === "dashboard" && <AdminDashboard />} */}
          {activeTab === "devices" && <DeviceManagement onNotify={showNotification} />}
          {activeTab === "profile" && <AdminProfile />}
          {activeTab === "users" && <UserManagement onNotify={showNotification} />}
          {activeTab === "addUser" && <AddUserForm onNotify={showNotification} />}
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}