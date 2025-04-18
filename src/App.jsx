import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useStore } from "./Store/Store";
import { Box, CircularProgress } from "@mui/material";
import Layout from "./Layout/Layout"; // Ensure Layout is imported


// Lazy loading components
const Login = React.lazy(() => import("./Pages/Login"));
const SignUp = React.lazy(() => import("./Pages/Signup"));
const Setings = React.lazy(() => import("./Pages/Register/Setings"));
const LivePreview = React.lazy(() => import("./Pages/LivePreview"));
const LivePage = React.lazy(() => import("./Pages/LivePage"));
const Downloads = React.lazy(() => import("./Pages/Downloads"));
const Serverissue = React.lazy(() => import("./Pages/Serverissue"));
const Resetpassword = React.lazy(() => import("./Pages/Resetpassword"));
const Forgotpassword = React.lazy(() => import("./Pages/Forgotpassword"));  
const Admin = React.lazy(() => import("./Pages/Admin/Admin"));
const Profile = React.lazy(() => import("./Pages/Profile"));


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
   
    {
      path: "/",
      element: maintanince ? <Serverissue /> :<ProtectedRoute element={<LivePage/>} />,
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
      path: "/resetpassword",
      element: maintanince ? <Serverissue /> : <GuestRoute element={<Resetpassword />} />,
    },
    {
      path: "/settings",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<Setings />} />,
    },
   
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
      path: "/livepage",
      element: maintanince ? <Serverissue /> : <ProtectedRoute element={<LivePreview />} />,
    },  
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}