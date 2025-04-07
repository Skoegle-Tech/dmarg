import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent, Button } from '@mui/material';
import { DevicesOther as DevicesIcon, People as PeopleIcon } from '@mui/icons-material';
import { useStore } from '../../../Store/Store';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    deviceCount: 0,
    userCount: 0
  });
  const { fetchDevicesByCustomerId, fetchCustomers } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [devices, users] = await Promise.all([
          fetchDevicesByCustomerId(),
          fetchCustomers()
        ]);

        setStats({
          deviceCount: devices?.length || 0,
          userCount: users?.length || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchDevicesByCustomerId, fetchCustomers]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                Users
              </Typography>
              <PeopleIcon fontSize="large" />
            </Box>
            <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
              {stats.userCount}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Total registered users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #FF9800 30%, #FFCA28 90%)',
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                Devices
              </Typography>
              <DevicesIcon fontSize="large" />
            </Box>
            <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
              {stats.deviceCount}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Total registered devices
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" component="h3" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  color="primary"
                  onClick={() => window.location.href = '#/admin?tab=users'}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  color="secondary"
                  onClick={() => window.location.href = '#/admin?tab=devices'}
                >
                  Manage Devices
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;