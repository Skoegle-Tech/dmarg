import { createContext, useContext, useEffect, useState } from "react";
import { signup, login, verifyUser, logout } from "./AuthApis";
import { fetchUserProfile, updateUserProfile } from "./ProfileApis";
import { fetchDevicesByCustomerId,GetRegisterdDevices,deleteDeviceByDeviceString,deleteMultipleDevices,AddUser,addDevicesToCustomer, fetchCustomers, deleteCustomer, deleteRegesteredDevice } from "./DeviceApi";
import { addGeofencingDevice, deleteGeofencingDevice, getGeofencingData, getRealTimeData, updateGeofencingRadius } from "./Geofencing";
import { addDevice, logRealtimeData } from "./Register";
import { sendOtpByEmail,  sendOtpBySms, verifyOtp, sendCustomMessageByEmail,sendCustomMessageBySms  } from "./Smtp";

const StoreContext = createContext(null);

export function useStore() {
  const contextValue = useContext(StoreContext);
  if (!contextValue) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return contextValue;
}

export function StoreProvider({ children }) {
  const [isLogin, setisLogin] = useState(localStorage?.getItem("isLogin") === "true" || false);
  const [isAdmin, setisAdmin] = useState(localStorage?.getItem("isAdmin") === "true" || false);
  const [token, settoken] = useState(localStorage?.getItem("token") || "");
  const [skipotp, setskipotp] = useState(true);
  const [skipsmsotp, setskipsmsotp] = useState(true);
  const [skipemailotp, setskipemailotp] = useState(true);


  useEffect(() => {
    async function VeruserState() {
      try {
        const result = await verifyUser();

        if (result?.valid) {
          setisLogin(true);
          setisAdmin(result?.isAdmin || false);
          localStorage.setItem("isAdmin",result?.isAdmin)
          localStorage.setItem("isLogin",result?.valid)

        } else {
          handleLogout(); 
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        handleLogout(); 
      }
    }
 if(isLogin){

   VeruserState();
 }
  }, []);

  const handleLogout = () => {
    localStorage.clear()
    setisLogin(false);
    setisAdmin(false);
    settoken("");
    console.clear()
    logout()
    window.location.href = "/login";
  };

  return (
    <StoreContext.Provider
      value={{
        signup,
        login,
        logout,
        setisAdmin,
        setisLogin,
        skipotp,
        settoken,
        isLogin,
        isAdmin,
        setskipotp,
        token,
        fetchUserProfile,
        updateUserProfile,
        fetchDevicesByCustomerId,
        deleteDeviceByDeviceString,
        deleteMultipleDevices,
        addDevicesToCustomer,
        AddUser,
        fetchCustomers,
        deleteCustomer,
        GetRegisterdDevices,
        deleteRegesteredDevice,
        deleteGeofencingDevice,
        addGeofencingDevice,
        updateGeofencingRadius,
        getGeofencingData,
        getRealTimeData,
        addDevice,
        logRealtimeData,
        sendOtpByEmail,
        sendOtpBySms,
        verifyOtp,
        sendCustomMessageByEmail,
        sendCustomMessageBySms,
        setskipemailotp,
        skipemailotp,
        setskipsmsotp,
        skipsmsotp


        

      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
