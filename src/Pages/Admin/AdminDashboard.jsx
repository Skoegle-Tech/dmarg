import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  DevicesOutlined as DevicesIcon, 
  PeopleAltOutlined as PeopleIcon,
  MemoryOutlined as MemoryIcon,
  VerifiedUserOutlined as SecurityIcon,
  CloudOutlined as CloudIcon,
  Refresh as RefreshIcon,
  TimelineOutlined as TimelineIcon,
  EventNoteOutlined as EventIcon,
  AccessTimeOutlined as ClockIcon,
  NotificationsOutlined as NotificationIcon
} from '@mui/icons-material';
import { useStore } from '../../Store/Store';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    deviceCount: 0,
    userCount: 0,
    activeDevices: 0,
    offlineDevices: 0
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState({
    server: { status: 'Operational', health: 92 },
    database: { status: 'Operational', health: 88 },
    storage: { status: 'Operational', health: 76 }
  });
  const [recentActivity] = useState([
    { id: 1, type: 'user', action: 'New user registered', time: '2 hours ago', user: 'Raj Kumar' },
    { id: 2, type: 'device', action: 'Device went offline', time: '4 hours ago', device: 'VMG-103' },
    { id: 3, type: 'device', action: 'New device registered', time: '1 day ago', device: 'VMG-201' },
    { id: 4, type: 'user', action: 'Password changed', time: '2 days ago', user: 'Priya Singh' }
  ]);
  
  const { fetchDevicesByCustomerId, fetchCustomers } = useStore();

  useEffect(() => {
    fetchData();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devices, users] = await Promise.all([
        fetchDevicesByCustomerId(),
        fetchCustomers()
      ]);

      // Calculate active vs offline devices (this is mock data since we don't have actual status)
      const activeCount = devices ? Math.floor(devices.length * 0.7) : 0;
      
      setStats({
        deviceCount: devices?.length || 0,
        userCount: users?.length || 0,
        activeDevices: activeCount,
        offlineDevices: (devices?.length || 0) - activeCount
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format time as HH:MM:SS
  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0];
  };

  const getStatusColor = (health) => {
    if (health >= 90) return 'success';
    if (health >= 70) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with Date/Time and Refresh */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 3 
      }}>
        <Box>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'text.secondary'
          }}>
            <ClockIcon fontSize="small" />
            <Typography variant="body2">
              Current UTC: {formatDate(currentDateTime)} {formatTime(currentDateTime)}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          variant="outlined"
          disabled={refreshing}
          sx={{ height: 40 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>
      
      {/* Stats Cards Row */}
      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Total Users</Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <PeopleIcon />
              </Avatar>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.userCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Registered accounts
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Total Devices</Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <DevicesIcon />
              </Avatar>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.deviceCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Registered devices
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Active Devices</Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <TimelineIcon />
              </Avatar>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.activeDevices}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Currently online
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={2} 
            sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2,
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">Offline Devices</Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <DevicesIcon />
              </Avatar>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                {stats.offlineDevices}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Need attention
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
       */}
      {/* Bottom Area - System Status and Recent Activity */}
      <Grid container spacing={3}>
        {/* System Status */}
        {/* <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} /> System Status
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>Server Status</Typography>
                </Box>
                <Chip 
                  label={systemStatus.server.status} 
                  color={getStatusColor(systemStatus.server.health)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={systemStatus.server.health} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 2,
                  bgcolor: 'grey.200'
                }} 
                color={getStatusColor(systemStatus.server.health)}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MemoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>Database Status</Typography>
                </Box>
                <Chip 
                  label={systemStatus.database.status} 
                  color={getStatusColor(systemStatus.database.health)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={systemStatus.database.health} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  mb: 2,
                  bgcolor: 'grey.200'
                }} 
                color={getStatusColor(systemStatus.database.health)}
              />
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>Storage Status</Typography>
                </Box>
                <Chip 
                  label={systemStatus.storage.status} 
                  color={getStatusColor(systemStatus.storage.health)}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={systemStatus.storage.health} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'grey.200'
                }} 
                color={getStatusColor(systemStatus.storage.health)}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button variant="outlined" size="small">
                View Detailed Status
              </Button>
            </Box>
          </Paper>
        </Grid> */}
        
        {/* Recent Activity */}
        {/* <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ mr: 1 }} /> Recent Activity
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <List sx={{ p: 0 }}>
              {recentActivity.map((activity) => (
                <ListItem 
                  key={activity.id} 
                  divider={activity.id !== recentActivity.length}
                  sx={{ px: 0 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: activity.type === 'user' ? 'primary.main' : 'secondary.main',
                        fontSize: '0.875rem'
                      }}
                    >
                      {activity.type === 'user' ? 
                        activity.user.charAt(0) : 
                        activity.device.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={activity.action}
                    secondary={activity.type === 'user' ? 
                      `By ${activity.user}` : 
                      `Device: ${activity.device}`
                    }
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Chip 
                    label={activity.time} 
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="outlined" size="small">
                View All Activity
              </Button>
            </Box>
          </Paper>
        </Grid> */}
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" component="h3" fontWeight="medium" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="contained"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }}
                  onClick={() => window.location.href = '#/admin?tab=devices'}
                >
                  Manage Devices
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2
                  }}
                  onClick={() => window.location.href = '#/admin?tab=users'}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="contained"
                  color="info"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2
                  }}
                  onClick={() => window.location.href = '#/admin?tab=addUser'}
                >
                  Add New User
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button 
                  variant="contained"
                  color="warning"
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2
                  }}
                  onClick={() => window.location.href = '#/admin?tab=profile'}
                >
                  Edit Profile
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