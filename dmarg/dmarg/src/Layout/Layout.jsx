import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Footer from "./Footor";
import LoginNav from "./LoginNav";
import Navbar from "./Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Menu from "./Menu";
import { makeStyles } from "@mui/styles";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useStyles = makeStyles((theme) => ({
    mobileMenu: {
        display: "none",
        [theme.breakpoints.down("sm")]: {
            display: "block",
        },
    },
}));

export default function Layout({ children, title }) {
    const classes = useStyles();
    const theme = useTheme();
    const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    return (
        <>
            <Helmet>
                <title>{title ? title : "Dmarg"}</title>
                <meta name="description" content="Welcome to Skoegle, your go-to platform." />
            </Helmet>
            <Navbar />
            <ToastContainer />
            
            <main>{children}</main>
            {isDesktop && <Footer />}
            <br/>
            <br/>
            {isMobileOrTablet && <Menu className={classes.mobileMenu} />}
        </>
    );
}