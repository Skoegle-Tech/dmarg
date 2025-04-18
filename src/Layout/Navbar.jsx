import { useState, useEffect } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { 
  Button, 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Fade,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { 
  Menu as MenuIcon, 
  AccountCircle, 
  Settings, 
  Logout, 
  Login, 
  Info,
  Mail,
  PersonAdd, 
  AdminPanelSettings, 
  LocationOn,
  ChevronRight,
  Home
} from "@mui/icons-material";
import { Link, useLocation,useNavigate } from "react-router-dom";
import { useStore } from "../Store/Store";
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const { isAdmin, isLogin, setisLogin,logout } = useStore();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  function LogoutManage() {
    handleProfileMenuClose();
     console.log("logout");
    logout();
    setisLogin(false);
    localStorage.clear();
    navigate('/login');
    // window.location.reload()
    
    if (mobileOpen) setMobileOpen(false);
  }

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        width: 250,
        pt: 1,
      }}
    >
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" py={2}>
        <Avatar 
          sx={{ 
            width: 60, 
            height: 60, 
            bgcolor: 'primary.main',
            mb: 1
          }}
        >
          <Typography variant="h5">D</Typography>
        </Avatar>
        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>D-MARG</Typography>
        <Typography variant="caption" align="center" sx={{ color: 'text.secondary' }}>Skoegle IOT Innovations Pvt Ltd</Typography>
      </Box>
      
      <Divider />
      
      <List>
        {!isLogin ? (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/"
              selected={isActive('/login')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            
            <ListItem 
              button 
              component={Link} 
              to="/signup"
              selected={isActive('/signup')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Sign Up " />
            </ListItem>


            <ListItem 
              button 
              component={Link} 
              to="https://skoegle.in/aboutus.html"
              selected={isActive('/aboutus')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText primary="About Us"/>
            </ListItem>

            <ListItem 
              button 
              component={Link} 
              to="https://skoegle.in/contactus.html"
              selected={isActive('/contactus')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Mail />
              </ListItemIcon>
              <ListItemText primary="Contact Us" />
            </ListItem>


            {/* <ListItem 
              button 
              component={Link} 
              to="/seting"
              selected={isActive('/downloads')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Downloads" />
            </ListItem> */}
          </>
        ) : (
          <>
            <ListItem 
              button 
              component={Link} 
              to="/"
              selected={isActive('/')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <ListItemText primary="Preview" />
            </ListItem>
            
            <ListItem 
              button 
              component={Link} 
              to="/livepage"
              selected={isActive('/livepage')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
              <MyLocationIcon />
              </ListItemIcon>
              <ListItemText primary="Live" />
            </ListItem>
            
            <ListItem 
              button 
              component={Link} 
              to="/downloads"
              selected={isActive('/downloads')}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary="Downloads" />
            </ListItem>

            {isLogin && (
              <ListItem 
                button 
                component={Link} 
                to="/profile"
                selected={isActive('/profile')}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mx: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
            )}

            {isAdmin && isLogin && (
              <ListItem 
                button 
                component={Link} 
                to="/admin"
                selected={isActive('/admin')}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mx: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin" />
              </ListItem>
            )}
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem 
              button 
              component={Link} 
              to="/login"
              onClick={LogoutManage}
              sx={{
                borderRadius: '0 20px 20px 0',
                mx: 1,
                mb: 1,
                color: 'error.main',
                '& .MuiListItemIcon-root': {
                  color: 'error.main',
                },
              }}
            >
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={2}
      sx={{ 
        backgroundColor: "rgb(4, 4, 38)",
        backgroundImage: "linear-gradient(90deg, rgb(4, 4, 38) 0%, rgb(29, 29, 70) 100%)"
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* <Typography 
              variant="subtitle1" 
              component={Link} 
              to="/" 
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                fontSize: '1rem', 
                fontWeight: 400,
                opacity: 0.8
              }}
            >
              Skoegle
            </Typography>
             */}
            <Typography 
              variant="h6" 
              noWrap 
              component={Link} 
              to="/" 
              sx={{ 
                ml: 2,
                textDecoration: 'none', 
                color: 'white',
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              D-MARG
            </Typography>
          </Box>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {isLogin ? (
            <>
              <Button 
                component={Link} 
                to="/" 
                variant={isActive('/') ? "contained" : "text"}
                startIcon={<LocationOn />}
                sx={{ 
                  color: isActive('/') ? "primary.contrastText" : "white",
                  px: 2,
                  py: 0.8,
                  borderRadius: '20px',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Preview
              </Button>
              <Button 
                component={Link} 
                to="/livepage" 
                variant={isActive('/livepage') ? "contained" : "text"}
                startIcon={<MyLocationIcon />}
                sx={{ 
                  color: isActive('/livepage') ? "primary.contrastText" : "white",
                  px: 2,
                  py: 0.8,
                  borderRadius: '20px',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Live
              </Button>

              <Button 
                component={Link} 
                to="/downloads" 
                variant={isActive('/downloads') ? "contained" : "text"}
                startIcon={<DownloadIcon />}
                sx={{ 
                  color: isActive('/downloads') ? "primary.contrastText" : "white",
                  px: 2,
                  py: 0.8,
                  borderRadius: '20px',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Downloads
              </Button>

              <Button 
                component={Link} 
                to="/settings" 
                variant={isActive('/settings') ? "contained" : "text"}
                startIcon={<Settings />}
                sx={{ 
                  color: isActive('/settings') ? "primary.contrastText" : "white",
                  px: 2,
                  py: 0.8,
                  borderRadius: '20px',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Add Device
              </Button>
              
              <IconButton 
                onClick={handleProfileMenuOpen}
                size="large"
                edge="end"
                color="inherit"
                sx={{ 
                  ml: 1,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                <AccountCircle />
              </IconButton>
              
              <Menu
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileMenuClose}
                TransitionComponent={Fade}
                elevation={3}
                sx={{ mt: 1 }}
              >
                {isLogin && (
                  <MenuItem 
                    component={Link} 
                    to="/profile"
                    onClick={handleProfileMenuClose}
                    dense
                  >
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                )}
                
                {isAdmin && isLogin && (
                  <MenuItem 
                    component={Link} 
                    to="/admin"
                    onClick={handleProfileMenuClose}
                    dense
                  >
                    <ListItemIcon>
                      <AdminPanelSettings fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Admin</ListItemText>
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem 
                  onClick={LogoutManage}
                  sx={{ color: 'error.main' }}
                  dense
                >
                  <ListItemIcon>
                    <Logout fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/login" 
                variant="outlined"
                startIcon={<Login />} 
                sx={{ 
                  color: "white", 
                  borderColor: "rgba(255,255,255,0.5)", 
                  borderRadius: '20px',
                  px: 2,
                  '&:hover': { 
                    borderColor: "white",
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Login
              </Button>
              
              <Button 
                component={Link} 
                to="/signup" 
                variant="contained" 
                startIcon={<PersonAdd />}
                sx={{ 
                  backgroundColor: "white", 
                  color: "rgb(4, 4, 38)",
                  borderRadius: '20px',
                  px: 2,
                  ml: 1,
                  fontWeight: 'bold',
                  '&:hover': { 
                    backgroundColor: "rgba(255,255,255,0.9)"
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
}