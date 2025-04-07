import React, { useState, useEffect } from "react";
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
  Skeleton
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
  Badge as BadgeIcon
} from "@mui/icons-material";

export default function Profile() {
  const { fetchUserProfile, updateUserProfile } = useStore();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const fetchedUser = await fetchUserProfile();
        setUser(fetchedUser?.user);
        setFormData({
          firstName: fetchedUser?.user.firstName || "",
          lastName: fetchedUser?.user.lastName || "",
          email: fetchedUser?.user.email || "",
          phoneNumber: fetchedUser?.user.phoneNumber || "",
          custommerId: fetchedUser?.user.custommerId || "",
          password: ""
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Unable to load profile data");
        setLoading(false);
      }
    };

    getUserProfile();
  }, [fetchUserProfile]);

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

  const handleUpdate = async () => {
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const updatedData = { ...formData };
    
    try {
      setUpdating(true);
      await updateUserProfile(updatedData);
      setIsEditing(false);
      setFormData({ ...formData, password: "" });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getInitials = () => {
    if (!formData.firstName || !formData.lastName) return "U";
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`;
  };

  const resetForm = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      custommerId: user?.custommerId || "",
      password: ""
    });
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <>
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
     </>
    );
  }

  return (
    <>
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
                          disabled={!isEditing || updating}
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
                      onClick={handleUpdate}
                      disabled={updating}
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Container>
   </>
  );
}