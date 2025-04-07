import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
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
    DevicesOutlined as DeviceIcon,
    Email as EmailIcon,
    Fingerprint as FingerprintIcon
  } from "@mui/icons-material";
  import { useState } from "react";
  
  const DeviceCard = ({ device, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
  
    const toggleExpand = () => {
      setExpanded(!expanded);
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
          },
          position: 'relative',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DeviceIcon color="primary" sx={{ mr: 1 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: "bold",
                color: "primary.main",
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {device.deviceString}
            </Typography>
            
            <Tooltip title="Delete Device">
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
  
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={<FingerprintIcon />} 
              label={`ID: ${device.custommerId.substring(0, 8)}...`}
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '100%' }}>
                {device.email || 'No email provided'}
              </Typography>
            </Box>
          </Box>
  
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Device Details
              </Typography>
              <Typography variant="body2" paragraph>
                {device.devicedetails || "No additional details available"}
              </Typography>
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
  
  export default DeviceCard;