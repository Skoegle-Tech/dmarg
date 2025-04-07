import { Box, Container, Grid, Typography, IconButton, Link, Divider, useTheme, useMediaQuery } from "@mui/material";
import { 
  Facebook as FacebookIcon, 
  Twitter as TwitterIcon, 
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon
} from "@mui/icons-material";

export default function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer"
      sx={{ 
        backgroundColor: "rgb(4,4,38)",
        color: "white",
        mt: 'auto',
        width: "100%"
      }}
    >
      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: isMobile ? 3 : 4 }}>
        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Logo and About */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #4db6ac 30%, #80cbc4 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent' 
                }}
              >
                D-MARG
              </Typography>
              <Typography 
                variant="subtitle2" 
                sx={{ mt: 0.5, opacity: 0.7, fontWeight: 'normal' }}
              >
                by Skoegle IOT Innovations Pvt Ltd
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Innovative tracking solutions for the modern world - keeping you connected to what matters most.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={() => window.open('https://www.facebook.com/skoegle', '_blank')} size="small" sx={{ color: '#4db6ac' }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => window.open('https://x.com/skoegledotin?s=09', '_blank')} size="small" sx={{ color: '#4db6ac' }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => window.open('https://www.instagram.com/skoegledotin/?igsh=MW51N2gwZjdvbWQ2aQ%3D%3D#', '_blank')} size="small" sx={{ color: '#4db6ac' }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => window.open('https://www.linkedin.com/company/skoegle-technologies-pvt-ltd/', '_blank')} size="small" sx={{ color: '#4db6ac' }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" target="_blank" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Box component="nav" 
            sx={{ display: 'flex' ,flexDirection: 'column',  gap: 1}}>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Home
              </Link>
              <Link href="https://skoegle.in/aboutus.html" color="inherit" underline="hover" target="_blank" sx={{ opacity: 0.8 }}>
                About Us
              </Link>
              <Link href="https://www.skoegle.in/allproduct.php" color="inherit" underline="hover" target="_blank" sx={{ opacity: 0.8 }}>
                Our Product
              </Link>
              <Link href="https://skoegle.in/contactus.html" color="inherit" underline="hover"  target="_blank" sx={{ opacity: 0.8 }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={6} sm={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ color: '#4db6ac' }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Bangalore, India
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" sx={{ color: '#4db6ac' }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  +91 9902495354
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" sx={{ color: '#4db6ac' }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  info@skoegle.in
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
      
      {/* Divider */}
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Copyright Bar */}
      <Container maxWidth="lg">
        <Box sx={{ 
          py: 2, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'center', 
          gap: isMobile ? 1 : 0
        }}>
          <Typography variant="body2" sx={{ opacity: 0.7, textAlign: 'center' }}>
            © {currentYear} Skoegle IOT Innovations Pvt Ltd. All rights reserved.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            opacity: 0.7,
            fontSize: '0.875rem'
          }}>
            <Link href="https://www.skoegle.in/privacypolicy.html" color="inherit" underline="hover" target="_blank">
              Privacy Policy
            </Link>
            <Link href="https://www.skoegle.in/Terms%20and%20Conditions.html" color="inherit" underline="hover" target="_blank">
              Terms and Conditions
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}