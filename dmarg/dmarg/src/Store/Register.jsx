import axios from "axios";

const { VITE_ENV, VITE_LOCAL_URL, VITE_WEB_URL } = import.meta.env;
const API_BASE_URL= VITE_ENV === "local" ? VITE_LOCAL_URL : VITE_WEB_URL;

export const addDevice = async (deviceName, cleanedDeviceCode, custommerId, nickname) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/verify/adddevice`, {
      deviceName,
      deviceCode: cleanedDeviceCode,
      custommerId,
      nickname,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding device:", error);
    throw error;
  }
};

export const logRealtimeData = async (deviceName, latitude, longitude, date, time) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/realtime/logs`, {
      deviceName,
      latitude,
      longitude,
      date,
      time,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging real-time data:", error);
    throw error;
  }
};