import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    Avatar,
    Chip,
    Collapse,
    CardActions,
    Button,
    Tooltip,
    Divider
  } from "@mui/material";
  import {
    DeleteOutlined as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    Email as EmailIcon,
    Key as KeyIcon,
    Fingerprint as FingerprintIcon,
    Phone as PhoneIcon
  } from "@mui/icons-material";
  import { useState } from "react";
  
  const UserCard = ({ user, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
  
    const toggleExpand = () => {
      setExpanded(!expanded);
    };
  
    // Generate avatar initials
    const getInitials = (firstName, lastName) => {
      return firstName?.charAt(0).toUpperCase() + (lastName?.charAt(0).toUpperCase() || '');
    };
  
    // Generate avatar color based on name
    const stringToColor = (string) => {
      if (!string) return '#3f51b5';
      let hash = 0;
      for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).slice(-2);
      }
      return color;
    };
  
    return (
      <Card 
        elevation={2} 
        sx={{ 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: stringToColor(user.firstName + user.lastName),
                width: 50,
                height: 50,
                mr: 2,
                fontWeight: 'bold'
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: "bold",
                  lineHeight: 1.2
                }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>
            
            <Tooltip title="Delete User">
              <IconButton 
                size="small" 
                onClick={onDelete} 
                sx={{ 
                  color: "error.main",
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.dark'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
  
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ mb: 1 }}>
            <Chip 
              icon={<FingerprintIcon />} 
              label={`ID: ${user.custommerId.substring(0, 8)}...`}
              size="small"
              variant="outlined"
              sx={{ mb: 1 }}
            />
          </Box>
  
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <KeyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                Password: {user.password ? '*'.repeat(8) : 'Not set'}
              </Typography>
              
              {user.phoneNumber && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  {user.phoneNumber}
                </Typography>
              )}
            </Box>
          </Collapse>
        </CardContent>
  
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button 
            size="small" 
            onClick={toggleExpand}
            endIcon={
              <ExpandMoreIcon sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} />
            }
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  export default UserCard;