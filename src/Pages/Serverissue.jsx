import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { WarningAmber } from "@mui/icons-material";

function ServerIssue() {


  return (
    <Container maxWidth="sm">
      <Paper
        elevation={6}
        sx={{
          textAlign: "center",
          p: 4,
          mt: 8,
          background: "linear-gradient(135deg, #37474F, #263238)", // Dark blue-gray tones
          color: "white",
          borderRadius: 4,
        }}
      >
        <WarningAmber sx={{ fontSize: 60, color: "#FFC107" }} /> {/* Yellow Warning Icon */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Under Maintenance
        </Typography>
        <Typography variant="body1" gutterBottom>
          Our servers are currently undergoing maintenance.
          From 02:00 P.M To 03:00 P.M .
          We'll be back soon!
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={()=>window.location.reload()} // Call function on button click
          sx={{ mt: 2, bgcolor: "#1565C0", "&:hover": { bgcolor: "#0D47A1" } }}
        >
          Refresh Page
        </Button>

        <Typography variant="caption" display="block" sx={{ mt: 3, opacity: 0.8 }}>
          Thank you for your patience.
        </Typography>
      </Paper>
    </Container>
  );
}

export default ServerIssue;
