import React, { useState , useEffect} from "react";
import Layout from "../Layout/Layout";
import { TextField, Button, Typography, Box, Container } from "@mui/material";
import axios from "axios"; // Import axios

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Dmarg Forgot Password";
  }, []);


  // Function to handle password reset request
  const forgotPassword = async (e) => {
    e.preventDefault(); // Prevent form submission

    // Basic Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors on each request attempt

      // Using axios to make the POST request
      const response = await axios.post("https://api.skoegle.com/api/auth/forgotpassword", {
        email,
      });

      // Handle success response
      if (response.status === 200) {
        const data = response.data;

        // Check if valid and user exists
        if (data.valid) {
          setSuccess("Password reset link has been sent to your email.");
          // Optionally, store or use the token if needed
          // localStorage.setItem("reset_token", data.token);
          console.log("Token:", data.token); // If needed, you can store or use the token
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (error) {
      // Handle error from axios
      setError(error.response?.data?.error || "User not registered with this email id.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Dmarg Forgot Password">       
    <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            mb: 10,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            textAlign: "center",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Enter your email, and we'll send you a link to reset your password.
          </Typography>

          <form onSubmit={forgotPassword}>
            <TextField
              fullWidth
              label="Enter Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {error && (
              <Typography color="error" variant="body2" mt={1}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" variant="body2" mt={1}>
                {success}
              </Typography>
            )}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                mt: 2,
                py: 1,
                backgroundColor: "#00796B",
                "&:hover": { backgroundColor: "#005a4f" },
              }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Box>
      </Container>
    </Layout>
  );
}
