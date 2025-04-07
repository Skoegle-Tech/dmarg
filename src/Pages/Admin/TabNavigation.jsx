import { Box, Tab, Tabs, useTheme, useMediaQuery } from "@mui/material";
import { 
  Dashboard as DashboardIcon,
  Devices as DevicesIcon, 
  Person as PersonIcon, 
  People as PeopleIcon, 
  PersonAdd as PersonAddIcon 
} from "@mui/icons-material";

const TabNavigation = ({ activeTab, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        background: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Tabs 
        value={activeTab} 
        onChange={(e, val) => onTabChange(val)}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            fontWeight: 600,
            color: theme.palette.text.secondary,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiTabs-indicator': {
            height: 4,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
          }
        }}
      >
        {/* <Tab 
          label={isMobile ? "" : "Dashboard"} 
          value="dashboard" 
          icon={<DashboardIcon />}
          iconPosition="start"
        /> */}
        <Tab 
          label={isMobile ? "" : "Devices"} 
          value="users" 
          icon={<DevicesIcon />}
          iconPosition="start" 
        />
        {/* <Tab 
          label={isMobile ? "" : "Profile"} 
          value="profile" 
          icon={<PersonIcon />}
          iconPosition="start" 
        /> */}
        <Tab 
          label={isMobile ? "" : "Users"} 
          value="devices" 
          icon={<PeopleIcon />}
          iconPosition="start" 
        />
        <Tab 
          label={isMobile ? "" : "Add User"} 
          value="addUser" 
          icon={<PersonAddIcon />}
          iconPosition="start" 
        />
      </Tabs>
    </Box>
  );
};

export default TabNavigation;