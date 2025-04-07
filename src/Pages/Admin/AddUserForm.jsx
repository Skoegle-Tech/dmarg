import { useState } from "react";
import { useStore } from "../../Store/Store";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Avatar,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  Alert
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonAddAlt1 as PersonAddIcon,
  Save as SaveIcon
} from "@mui/icons-material";

const AddUserForm = ({ onNotify }) => {
  const { AddUser } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    custommerId: localStorage.getItem("custommerid"),
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email format";
    if (!/^\d{10}$/.test(formData.phoneNumber)) errors.phoneNumber = "Phone number must be 10 digits";
    if (!formData.password || formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
    
    // Reset success state when form is changed after a successful submission
    if (formSuccess) {
      setFormSuccess(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      onNotify("Please fix the validation errors", "error");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await AddUser(formData);
      if (response?.valid === false) {
        onNotify(response.message || "Failed to add user!", "error");
      } else {
        setFormSuccess(true);
        onNotify("User added successfully under the same customer ID!", "success");
        // Clear the form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          custommerId: localStorage.getItem("custommerid"),
        });
      }
    } catch (error) {
      onNotify("Error adding user!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        maxWidth: 600, 
        margin: "0 auto", 
        p: { xs: 2, sm: 4 },
        borderRadius: 2
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            mb: 2,
            boxShadow: 2
          }}
        >
          <PersonAddIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Add New User
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Create a new user account under your customer ID
        </Typography>
      </Box>

      {formSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, borderRadius: 1 }}
          onClose={() => setFormSuccess(false)}
        >
          User has been added successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleAddUser} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              name="firstName"
              value={formData.firstName}
              onChange={handleFormChange}
              required
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              name="lastName"
              value={formData.lastName}
              onChange={handleFormChange}
              required
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              variant="outlined"
              fullWidth
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleFormChange}
              required
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleFormChange}
              required
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleFormChange}
              required
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              boxShadow: 2,
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Card sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Customer ID: <b>{localStorage.getItem("custommerid") || "Not available"}</b>
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1, opacity: 0.7 }}>
          New users will be created under your customer ID and will have access to your registered devices
        </Typography>
      </Card>
    </Paper>
  );
};

export default AddUserForm;