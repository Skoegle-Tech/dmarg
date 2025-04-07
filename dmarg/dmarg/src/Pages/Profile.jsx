import React, { useState, useEffect, useMemo } from "react";
import Layout from "../Layout/Layout";
import { useStore } from "../Store/Store";
import {
  Avatar,
  Button,
  Grid,
  Typography,
  Box,
  Container,
  Paper,
  TextField,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Fade,
  Slide,
  Tab,
  Tabs,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { toast } from "react-toastify";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  VpnKey as KeyIcon,
  Badge as BadgeIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

export default function Profile() {
  const { fetchUserProfile, updateUserProfile, sendOtpByEmail, verifyOtp } = useStore();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({}); // To track original data
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // OTP related states
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const fetchedUser = await fetchUserProfile();
        setUser(fetchedUser?.user);
        
        const initialData = {
          firstName: fetchedUser?.user.firstName || "",
          lastName: fetchedUser?.user.lastName || "",
          email: fetchedUser?.user.email || "",
          phoneNumber: fetchedUser?.user.phoneNumber || "",
          custommerId: fetchedUser?.user.custommerId || "",
          password: fetchedUser?.user.password || ""
        };
        
        setFormData(initialData);
        setOriginalData(initialData); // Store original data for comparison
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Unable to load profile data");
        setLoading(false);
      }
    };

    getUserProfile();
  }, [fetchUserProfile]);

  // Check if form data has changed compared to original data
  const hasFormChanged = useMemo(() => {
    if (!originalData || Object.keys(originalData).length === 0) return false;
    
    // Check each field to see if any have changed
    return Object.keys(formData).some(key => {
      // Skip password if it's empty as it might not be returned from the backend
      if (key === 'password' && !formData[key]) return false;
      
      return formData[key] !== originalData[key];
    });
  }, [formData, originalData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (formData.password && formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    
    const phonePattern = /^[0-9]{10}$/;
    if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must be 10 digits";
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    return errors;
  };

  // Send OTP before update
  const handleInitiateUpdate = async () => {
    // If no changes made, no need to proceed
    if (!hasFormChanged) {
      setIsEditing(false);
      return;
    }
    
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    try {
      setOpenOtpDialog(true);
      setSendingOtp(true);
      // Send OTP to the user's email
      await sendOtpByEmail(formData.email);
      setIsOtpSent(true);
      setSendingOtp(false);
      toast.success("Verification code sent to your email");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setSendingOtp(false);
      toast.error("Failed to send verification code. Please try again.");
      setOpenOtpDialog(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (e) => {
    setOtpValue(e.target.value);
    setOtpError("");
  };

  // Resend OTP function
  const handleResendOtp = async () => {
    try {
      setSendingOtp(true);
      await sendOtpByEmail(formData.email);
      setSendingOtp(false);
      toast.success("New verification code sent to your email");
    } catch (error) {
      console.error("Error resending OTP:", error);
      setSendingOtp(false);
      toast.error("Failed to send verification code. Please try again.");
    }
  };

  // Verify OTP and then update profile
  const handleVerifyAndUpdate = async () => {
    if (!otpValue || otpValue.trim() === "") {
      setOtpError("Please enter the verification code");
      return;
    }

    try {
      setVerifyingOtp(true);
      
      // Verify the OTP
      const isOtpValid = await verifyOtp(formData.email, otpValue);
      
      if (isOtpValid) {
        // OTP verified successfully, proceed with profile update
        const updatedData = { ...formData };
        await updateUserProfile(updatedData);
        
        // Update original data to match current form data
        setOriginalData({...formData});
        
        // Close dialog and reset OTP states
        setOpenOtpDialog(false);
        setIsOtpSent(false);
        setOtpValue("");
        setIsEditing(false);
        
        toast.success("Profile updated successfully!");
      } else {
        setOtpError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Error during verification or update:", error);
      setOtpError("Verification failed. Please try again.");
      toast.error("Failed to verify or update profile. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const closeOtpDialog = () => {
    setOpenOtpDialog(false);
    setIsOtpSent(false);
    setOtpValue("");
    setOtpError("");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getInitials = () => {
    if (!formData.firstName || !formData.lastName) return "U";
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
  };

  const resetForm = () => {
    setFormData({...originalData});
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout title="Dmarg - Profile">
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} container direction="column" alignItems="center">
                <Skeleton variant="circular" width={120} height={120} />
                <Skeleton variant="text" width="80%" height={30} sx={{ mt: 2 }} />
                <Skeleton variant="text" width="60%" height={20} />
              </Grid>
              <Grid item xs={12} md={8}>
                <Skeleton variant="text" width="40%" height={40} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Dmarg - Profile">
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Slide direction="down" in={!loading} timeout={500}>
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 2,
              overflow: "hidden",
              bgcolor: "background.paper",
              transition: "all 0.3s ease-in-out"
            }}
          >
            {/* Profile Header */}
            <Box 
              sx={{ 
                p: 4, 
                bgcolor: "primary.main", 
                color: "primary.contrastText",
                background: "linear-gradient(to right, #00796b, #4db6ac)"
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "white",
                      color: "primary.main",
                      fontSize: 32,
                      fontWeight: "bold",
                      border: "4px solid white",
                      boxShadow: theme.shadows[3]
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h4" fontWeight="bold">
                    {formData.firstName} {formData.lastName}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <BadgeIcon fontSize="small" />
                    <Typography variant="subtitle1" sx={{ ml: 1, opacity: 0.8 }}>
                      {formData.custommerId}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant={isMobile ? "fullWidth" : "standard"}
                indicatorColor="secondary"
              >
                <Tab 
                  label="Personal Details" 
                  icon={<PersonIcon />}
                  iconPosition="start"
                  sx={{ fontWeight: "medium" }}
                />
                <Tab 
                  label="Account Security" 
                  icon={<KeyIcon />} 
                  iconPosition="start"
                  sx={{ fontWeight: "medium" }}
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {/* Personal Details Tab */}
              {activeTab === 0 && (
                <Fade in={activeTab === 0} timeout={500}>
                  <Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="First Name"
                          variant="outlined"
                          fullWidth
                          disabled={!isEditing || updating}
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          error={!!errors.firstName}
                          helperText={errors.firstName}
                          InputProps={{
                            startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Last Name"
                          variant="outlined"
                          fullWidth
                          disabled={!isEditing || updating}
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          error={!!errors.lastName}
                          helperText={errors.lastName}
                          InputProps={{
                            startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email Address"
                          variant="outlined"
                          fullWidth
                          disabled={true}
                          // disabled={!isEditing || updating}
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          error={!!errors.email}
                          helperText={errors.email}
                          InputProps={{
                            startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Phone Number"
                          variant="outlined"
                          fullWidth
                          disabled={!isEditing || updating}
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          error={!!errors.phoneNumber}
                          helperText={errors.phoneNumber}
                          InputProps={{
                            startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Fade>
              )}

              {/* Account Security Tab */}
              {activeTab === 1 && (
                <Fade in={activeTab === 1} timeout={500}>
                  <Box>
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Change Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Update your password to keep your account secure. Your password should be at least 6 characters long.
                        </Typography>
                        <TextField
                          label="New Password"
                          variant="outlined"
                          fullWidth
                          type="password"
                          name="password"
                          value={formData.password || ""}
                          onChange={handleChange}
                          disabled={!isEditing || updating}
                          error={!!errors.password}
                          helperText={errors.password}
                          InputProps={{
                            startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />
                          }}
                          sx={{ mt: 2 }}
                        />
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Account ID
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Your unique account identifier.
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <TextField
                            variant="outlined"
                            fullWidth
                            value={formData.custommerId || ""}
                            disabled
                            InputProps={{
                              readOnly: true,
                              startAdornment: <BadgeIcon color="action" sx={{ mr: 1 }} />
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Fade>
              )}

              {/* Action Buttons */}
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2
                }}
              >
                {!isEditing ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<CancelIcon />}
                      onClick={resetForm}
                      disabled={updating}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      onClick={handleInitiateUpdate}
                      disabled={updating || !hasFormChanged} // Disable if no changes or updating
                    >
                      {updating ? "Saving..." : hasFormChanged ? "Save Changes" : "No Changes"}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Container>

      {/* OTP Verification Dialog */}
      <Dialog
        open={openOtpDialog}
        onClose={closeOtpDialog}
        aria-labelledby="otp-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="otp-dialog-title">
          <Box display="flex" alignItems="center">
            <LockOpenIcon sx={{ mr: 1, color: 'primary.main' }} />
            Verify Your Identity
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            For security purposes, we've sent a verification code to your email {formData.email}. Please enter the code below to complete your profile update.
          </DialogContentText>
          
          {sendingOtp ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Verification Code"
                type="text"
                fullWidth
                variant="outlined"
                value={otpValue}
                onChange={handleOtpChange}
                error={!!otpError}
                helperText={otpError}
                inputProps={{ maxLength: 6 }}
                placeholder="Enter 6-digit code"
                sx={{ mt: 1 }}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleResendOtp}
                  disabled={sendingOtp}
                >
                  Resend Code
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeOtpDialog} color="inherit" disabled={verifyingOtp}>
            Cancel
          </Button>
          <Button 
            onClick={handleVerifyAndUpdate} 
            variant="contained" 
            color="primary"
            disabled={verifyingOtp || sendingOtp}
            startIcon={verifyingOtp ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {verifyingOtp ? "Verifying..." : "Verify & Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}