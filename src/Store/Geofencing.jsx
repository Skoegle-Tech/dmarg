import axios from 'axios';

const { VITE_ENV, VITE_LOCAL_URL, VITE_WEB_URL } = import.meta.env;
const BASE_URL= VITE_ENV === "local" ? VITE_LOCAL_URL : VITE_WEB_URL;

export const getRealTimeData = async (device) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/realtime/${device}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    throw error;
  }
};

export const getGeofencingData = async (device) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/geofencing/${device}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching geofencing data:', error);
    throw error;
  }
};

export const updateGeofencingRadius = async (device, radius) => {
  try {
    await axios.put(`${BASE_URL}/api/geofencing/${device}/${radius}`, { radius });
  } catch (error) {
    console.error('Error updating geofencing radius:', error);
    throw error;
  }
};

export const addGeofencingDevice = async (selectedDevice, data) => {
  try {
    await axios.post(
      `${BASE_URL}/api/device/geofencing`,
      {
        deviceName: selectedDevice,
        latitude: data.lat,
        longitude: data.lng,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage?.getItem('token')}`,
        },
      }
    );
  } catch (error) {
    console.error('Error adding geofencing device:', error);
    throw error;
  }
};

export const deleteGeofencingDevice = async (selectedDevice) => {
  try {
    await axios.delete(`${BASE_URL}/api/geofencing/${selectedDevice}`, {
      data: { deviceName: selectedDevice },
      headers: {
        Authorization: `Bearer ${localStorage?.getItem('token')}`,
      },
    });
  } catch (error) {
    console.error('Error deleting geofencing device:', error);
    throw error;
  }
};
