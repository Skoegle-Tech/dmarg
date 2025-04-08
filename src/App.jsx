import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useStore } from "./Store/Store";
import { Box, CircularProgress } from "@mui/material";
import Layout from "./Layout/Layout"; // Ensure Layout is imported
import Live from "./Pages/Live/Live";
import Profile from "./Pages/Profile";
import Admin from "./Pages/Admin/Admin";
import Forgotpassword from "./Pages/Forgotpassword";
import Resetpassword from "./Pages/Resetpassword";
import Serverissue from "./Pages/Serverissue"; // Server Issue page
import Downloads from "./Pages/Downloads";
import Home from "./Pages/Home";
import LivePreview from "./Pages/LivePreview";

// Lazy loading components
const Login = React.lazy(() => import("./Pages/Login"));
const SignUp = React.lazy(() => import("./Pages/Signup"));
const Setings = React.lazy(() => import("./Pages/Register/Setings"));

function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <CircularProgress />
    </Box>
  );
}

export default function App() {
  const { isLogin, isAdmin } = useStore();

  const maintanince = false; // Set this to true to activate maintenance mode.

  const GuestRoute = ({ element }) => (!isLogin ? element : <Navigate to="/" />);
  const ProtectedRoute = ({ element }) => (isLogin ? element : <Navigate to="/login" />);
  const AdminRoute = ({ element }) => (isLogin && isAdmin ? element : <Navigate to="/login" />);

  const router = createBrowserRouter([
    // {
    //   path: "/",
    //   element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Live />} />,
    // },
    {
      path: "/",
      element: maintanince ? <Serverissue /> :<ProtectedRoute element={<Home/>} />,
    },
    {
      path: "/signup",
      element: maintanince ? <Serverissue /> : <GuestRoute element={<SignUp />} />,
    },
    {
      path: "/login",
      element: maintanince ? <Serverissue /> : <GuestRoute element={<Login />} />,
    },
    {
      path: "/forgotpassword",
      element: maintanince ? <Serverissue /> : <GuestRoute element={<Forgotpassword />} />,
    },
    {
      path: "/Resetpassword",
      element: maintanince ? <Serverissue /> : <GuestRoute element={<Resetpassword />} />,
    },
    {
      path: "/settings",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Setings />} />,
    },
    // {
    //   element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Track />} />,
    // },   path: "/track",
    //
    {
      path: "/profile",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Profile />} />,
    },
    {
      path: "/admin",
      element: maintanince ? <Serverissue /> : <AdminRoute element={<Admin />} />,
    },
    {
      path : "/downloads",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Downloads />} />,
    },
    {
      path: "/home",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<LivePreview />} />,
    },
    {
      path: "/",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<LivePreview />} />,
    },
    // {
    //   path :"/home",
    //   element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Home />} />,
    // },
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
