import React, { useState, useEffect } from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Badge,
  Tooltip,
  useTheme,
  Zoom,
  useMediaQuery
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Login as LoginIcon, 
  PersonAdd as PersonAddIcon, 
  Logout as LogoutIcon, 
  Visibility as VisibilityIcon, 
  AccountCircle as AccountCircleIcon, 
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../Store/Store';

const Menu = () => {
  const { isAdmin, isLogin, setisLogin,logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [value, setValue] = useState(0);
  
  // Set active navigation item based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/track') setValue(1);
    else if (path === '/settings') setValue(2);
    else if (path === '/profile') setValue(3);
    else if (path === '/mbpannel/admin') setValue(4);
    else if (path === '/login') setValue(5);
    else if (path === '/signup') setValue(6);
  }, [location.pathname]);

  const handleLogout = () => {
    console.log("logout");
    logout();
    setisLogin(false);
    localStorage.clear();
    navigate('/login');
    // window.location.reload()
  };

  return (
    <Paper 
      elevation={8} 
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        padding: '0 8px',
        backdropFilter: 'blur(10px)',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(180deg, rgba(45,45,58,0.9) 0%, rgba(25,25,35,0.95) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(250,250,250,0.95) 100%)'
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          height: isMobile ? '72px' : '64px',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          justifyContent: 'space-around',
          '& .MuiBadge-root': {
            padding: '0 4px'
          }
        }}
      >
        {/* Conditional navigation items for logged-in users */}
        {isLogin && (
          <>
            <Tooltip title="Home" placement="top" TransitionComponent={Zoom}>
              <BottomNavigationAction
                component={Link}
                to="/"
                label="Home"
                icon={
                  <Badge color="secondary" variant={value === 0 ? "dot" : "standard"} invisible={value !== 0}>
                    <HomeIcon fontSize={isMobile ? "medium" : "small"} />
                  </Badge>
                }
                sx={{
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                  '&:not(.Mui-selected)': {
                    color: theme.palette.text.secondary,
                  },
                  transition: 'all 0.2s ease',
                  minWidth: 0
                }}
              />
            </Tooltip>

            {/* <Tooltip title="Live Tracking" placement="top" TransitionComponent={Zoom}>
              <BottomNavigationAction
                component={Link}
                to="/track"
                label="Track"
                icon={
                  <Badge color="secondary" variant={value === 1 ? "dot" : "standard"} invisible={value !== 1}>
                    <VisibilityIcon fontSize={isMobile ? "medium" : "small"} />
                  </Badge>
                }
                sx={{
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                  '&:not(.Mui-selected)': {
                    color: theme.palette.text.secondary,
                  },
                  transition: 'all 0.2s ease',
                  minWidth: 0
                }}
              />
            </Tooltip> */}
            
            <Tooltip title="Settings" placement="top" TransitionComponent={Zoom}>
              <BottomNavigationAction
                component={Link}
                to="/settings"
                label="Settings"
                icon={
                  <Badge color="secondary" variant={value === 2 ? "dot" : "standard"} invisible={value !== 2}>
                    <SettingsIcon fontSize={isMobile ? "medium" : "small"} />
                  </Badge>
                }
                sx={{
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                  '&:not(.Mui-selected)': {
                    color: theme.palette.text.secondary,
                  },
                  transition: 'all 0.2s ease',
                  minWidth: 0
                }}
              />
            </Tooltip>

          
              <Tooltip title="Profile" placement="top" TransitionComponent={Zoom}>
                <BottomNavigationAction
                  component={Link}
                  to="/profile"
                  label="Profile"
                  icon={
                    <Badge color="secondary" variant={value === 3 ? "dot" : "standard"} invisible={value !== 3}>
                      <AccountCircleIcon fontSize={isMobile ? "medium" : "small"} />
                    </Badge>
                  }
                  sx={{
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                    },
                    '&:not(.Mui-selected)': {
                      color: theme.palette.text.secondary,
                    },
                    transition: 'all 0.2s ease',
                    minWidth: 0
                  }}
                />
              </Tooltip>
          
             { isAdmin &&<Tooltip title="Admin Panel" placement="top" TransitionComponent={Zoom}>
                <BottomNavigationAction
                  component={Link}
                  to="/admin"
                  label="Admin"
                  icon={
                    <Badge color="secondary" variant={value === 4 ? "dot" : "standard"} invisible={value !== 4}>
                      <AdminIcon fontSize={isMobile ? "medium" : "small"} />
                    </Badge>
                  }
                  sx={{
                    '&.Mui-selected': {
                      color: theme.palette.primary.main,
                    },
                    '&:not(.Mui-selected)': {
                      color: theme.palette.text.secondary,
                    },
                    transition: 'all 0.2s ease',
                    minWidth: 0
                  }}
                />
              </Tooltip>}
       
            
            <Tooltip title="Logout" placement="top" TransitionComponent={Zoom}>
              <BottomNavigationAction
                label="Logout"
                icon={<LogoutIcon fontSize={isMobile ? "medium" : "small"} />}
                onClick={handleLogout}
                sx={{
                  color: theme.palette.error.main,
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: theme.palette.error.light + '20',
                  },
                  transition: 'all 0.2s ease',
                  minWidth: 0
                }}
              />
            </Tooltip>
          </>
        )}

        {/* Conditional navigation items for guests */}
        {!isLogin && (
          <>
            <Tooltip title="Login" placement="top" TransitionComponent={Zoom}>
              <BottomNavigationAction
                component={Link}
                to="/login"
                label="Login"
                icon={
                  <Badge color="secondary" variant={value === 5 ? "dot" : "standard"} invisible={value !== 5}>
                    <LoginIcon fontSize={isMobile ? "medium" : "small"} />
                  </Badge>
                }
                sx={{
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                  '&:not(.Mui-selected)': {
                    color: theme.palette.text.secondary,
                  },
                  transition: 'all 0.2s ease',
                  flexGrow: 1
                }}
              />
            </Tooltip>

            <Tooltip title="Sign Up" placement="top" TransitionComponent={Zoom}>
              <BottomNavigationAction
                component={Link}
                to="/signup"
                label="Sign Up"
                icon={
                  <Badge color="secondary" variant={value === 6 ? "dot" : "standard"} invisible={value !== 6}>
                    <PersonAddIcon fontSize={isMobile ? "medium" : "small"} />
                  </Badge>
                }
                sx={{
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                  '&:not(.Mui-selected)': {
                    color: theme.palette.text.secondary,
                  },
                  transition: 'all 0.2s ease',
                  flexGrow: 1
                }}
              />
            </Tooltip>
          </>
        )}
      </BottomNavigation>
    </Paper>
  );
};

export default Menu;