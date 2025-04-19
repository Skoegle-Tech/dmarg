import axios from 'axios';

const { VITE_ENV, VITE_LOCAL_URL, VITE_WEB_URL } = import.meta.env;


const BASE_URL = VITE_ENV === "local"
  ? `${VITE_LOCAL_URL}/api`
  : `${VITE_WEB_URL}/api`;


export const getFilteredVideos = async (currentFilter) => {
  console.log("Current Filter:", currentFilter);
  try {
    const response = await axios.get(`${BASE_URL}/dmarg/filtervidios`, {
      params: {
        fromdate: currentFilter.fromDate,
        todate: currentFilter.fromDate,
        fromtime: currentFilter.fromTime,
        totime: currentFilter.toTime,
        deviceName: currentFilter.selectedDevice
      }
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch videos");
  }
};

// Check live video status
export const checkLiveStatus = async (formattedDate, twoMinutesAgoTime, currentTime, selectedDevice) => {
  try {
    const response = await axios.get(`${BASE_URL}/dmarg/checklive`, {
      params: {
        fromdate: formattedDate,
        todate: formattedDate,
        fromtime: twoMinutesAgoTime,
        totime: currentTime,
        deviceName: selectedDevice
      }
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to check live status");
  }
};
