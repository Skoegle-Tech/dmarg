
import React, { useState , useEffect } from "react";
import Layout from "../Layout/Layout";
import { 
  TextField, Button, Typography, Box, Container, 
  InputAdornment, IconButton 
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Resetpasswordpassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(true);  // Changed to true initially
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);  // Changed to true initially

  
  useEffect(() => {
    document.title = "Forgot Password";
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    alert("Password set successfully!");
  };

  return (
    <Layout title= "Dmarg Reset Password">
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 18,
            mb: 22,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Set Your Password
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Password Field */}
            <TextField
              fullWidth
              label="Enter Password"
              type={showPassword ? "password" : "text"} // FIXED toggle logic
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "password" : "text"} // FIXED toggle logic
              variant="outlined"
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1, 
                backgroundColor: "#00796B",
                "&:hover": { backgroundColor: "#005a4f" },
              }}
            >
              Set Password
            </Button>
          </form>
        </Box>
      </Container>
    </Layout>
  );
}