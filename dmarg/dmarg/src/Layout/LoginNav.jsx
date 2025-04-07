
import { AppBar, Toolbar, Typography, Box, Container, Button, Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

export default function LoginNav(){

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);



    return(
        <>
           {/* Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "rgb(4,4,38)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Skoegle</Typography>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>D-Marg</Typography>
          <Box>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleMenuClose}>Login</MenuItem>
              <MenuItem onClick={handleMenuClose}>Sign Up</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
        
        </>
    )
}