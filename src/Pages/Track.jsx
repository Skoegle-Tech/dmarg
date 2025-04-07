import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { firebaseConfig } from "./Firebase";
import Layout from "../Layout/Layout";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Snackbar,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useStore } from "../Store/Store";
import { useMediaQuery } from '@mui/material';

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const LiveGPSTracker = () => {
  const mapRef = useRef(null);
  const polylineRefs = useRef({});
  const markerRefs = useRef({});
  const [logsData, setLogsData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { GetRegisterdDevices } = useStore();
  const [devices, setDevices] = useState([]);
  // 🔹 Set default lat/lng values to avoid "undefined" errors
  const [latitudelive, setLatitude] = useState(13.003207);
  const [longitudelive, setLongitude] = useState(77.578762);

  // 🔹 Calculate default dates
  const calculateDefaultDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    const twoDaysAgo = new Date(today);

    yesterday.setDate(today.getDate() );
    twoDaysAgo.setDate(today.getDate() - 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(twoDaysAgo),
      endDate: formatDate(yesterday),
    };
  };

  const { startDate: defaultStartDate, endDate: defaultEndDate } = calculateDefaultDates();

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 Initialize Map when lat/lng are available
  useEffect(() => {
    const fetchDevices = async () => {
      const devicesData = await GetRegisterdDevices();
      setDevices(devicesData.devices);
      if (devicesData.devices.length > 0) {
        setSelectedDevice(devicesData.devices[0].deviceName);
      }
    };

    fetchDevices();

    if (!mapRef.current) {
      mapRef.current = L.map("map", { zoomControl: false }).setView(
        [latitudelive, longitudelive],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    fetchLogs();
  }, [latitudelive, longitudelive]);

  useEffect(() => {
    if (selectedDevice) {
      fetchLogs();
    }
  }, [selectedDevice, startDate, endDate]);

  // 🔹 Fetch Historical Logs
  const fetchLogs = async () => {
    const deviceRef = ref(database, `${selectedDevice}/Logs`);
    try {
      onValue(
        deviceRef,
        (snapshot) => {
          const logs = snapshot.val();
          if (logs) {
            const organizedData = Object.keys(logs).map((key) => {
              const { timestamp } = logs[key];
              const [date, time, lat, lng] = timestamp.split(",");
              return { lat: parseFloat(lat), lng: parseFloat(lng), time, date };
            });
            setLogsData({ [selectedDevice]: organizedData });
            filterLogs({ [selectedDevice]: organizedData });
          } else {
            // console.log("No logs available for", deviceRef.toString());
            setLogsData({ [selectedDevice]: [] });
            filterLogs({ [selectedDevice]: [] });
          }
        },
        (error) => {
          console.error("Error fetching logs:", error);
        }
      );
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // 🔹 Filter Logs and Draw on Map
  const filterLogs = (logs) => {
    const [startYear, startMonth, startDay] = startDate.split("-");
    const startFormattedDate = new Date(startYear, startMonth - 1, startDay);

    const [endYear, endMonth, endDay] = endDate.split("-");
    const endFormattedDate = new Date(endYear, endMonth - 1, endDay);

    let filteredData = Object.keys(logs).reduce((acc, device) => {
      const deviceLogs = logs[device];
      const filteredDeviceLogs = deviceLogs.filter((log) => {
        const [logDay, logMonth, logYear] = log.date.split("/");
        const logFormattedDate = new Date(`20${logYear}`, logMonth - 1, logDay);
        return logFormattedDate >= startFormattedDate && logFormattedDate <= endFormattedDate;
      });
      acc[device] = filteredDeviceLogs;
      return acc;
    }, {});

    // if (Object.keys(filteredData).every(device => filteredData[device].length === 0)) {
    //   setSnackbarMessage("No logs found for the selected date range.");
    // }

    // Clear existing polylines and markers
    Object.keys(polylineRefs.current).forEach(device => {
      if (polylineRefs.current[device]) {
        polylineRefs.current[device].remove();
        delete polylineRefs.current[device];
      }
    });

    Object.keys(markerRefs.current).forEach(device => {
      if (markerRefs.current[device]) {
        markerRefs.current[device].forEach(marker => marker.remove());
        delete markerRefs.current[device];
      }
    });

    Object.keys(filteredData).forEach(device => {
      const route = filteredData[device].map((point) => [point.lat, point.lng]);

      polylineRefs.current[device] = L.polyline(route, { color: device === "Device-1" ? "blue" : device === "Device-2" ? "green" : "purple", weight: 3 }).addTo(mapRef.current);

      const startIcon = L.icon({
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/projects-4f71b.appspot.com/o/red%20blue-location-icon-png-19.png?alt=media&token=dc4aac49-4aaa-4db3-93c4-a2c51c0df152",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const endIcon = L.icon({
        iconUrl: "https://firebasestorage.googleapis.com/v0/b/projects-4f71b.appspot.com/o/green%20blue-location-icon-png-19.png?alt=media&token=10185d49-0932-4ba0-b61d-059dc0c14b08",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      if (filteredData[device].length > 0) {
        markerRefs.current[device] = [
          L.marker([filteredData[device][0].lat, filteredData[device][0].lng], { icon: startIcon }).addTo(mapRef.current),
          L.marker([filteredData[device][filteredData[device].length - 1].lat, filteredData[device][filteredData[device].length - 1].lng], { icon: endIcon }).addTo(mapRef.current)
        ];

        // Add click event to markers for sharing
        markerRefs.current[device].forEach((marker, index) => {
          marker.on('click', () => {
            const pointsToShare = getPointsToShare(filteredData[device]);
            generateShareUrl(pointsToShare);
          });
        });
      }
    });
  };

  // 🔹 Handle Date Change
  const handleDateChange = (event) => {
    const { id, value } = event.target;

    if (id === "start-date") {
      if (new Date(value) > new Date(endDate)) {
        setErrorMessage("Start date cannot be greater than end date.");
        return;
      }
      setStartDate(value);
    } else {
      if (new Date(startDate) > new Date(value)) {
        setErrorMessage("Start date cannot be greater than end date.");
        return;
      }
      setEndDate(value);
    }

    setErrorMessage("");
  };

  // 🔹 Handle Device Change
  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  // 🔹 Handle View on Google Maps
  const handleViewOnGMaps = () => {
    const pointsToShare = getPointsToShare(logsData[selectedDevice]);
    generateShareUrl(pointsToShare);
  };

  // 🔹 Get 20 points to share (start, end, and 18 middle points)
  const getPointsToShare = (points) => {
    if (points.length <= 20) return points;

    const step = Math.floor(points.length / 19);
    const middlePoints = points.slice(1, -1).filter((_, index) => index % step === 0).slice(0, 18);
    return [points[0], ...middlePoints, points[points.length - 1]];
  };

  // 🔹 Generate shareable URL
  const generateShareUrl = (pathPoints) => {
    if (pathPoints.length > 1) {
      const urlBase = "https://www.google.com/maps/dir/";
      const coords = pathPoints.map((point) => `${point.lat},${point.lng}`).join("/");
      const url = `${urlBase}${coords}?entry=ttu`;
      window.open(url, "_blank");
    } else {
      setSnackbarMessage("Not enough points to generate a shareable link.");
    }
  };

  // Media Query for responsive design
  const isMobile = useMediaQuery('(max-width:900px)');

  return (
    <Layout title="Live GPS Tracker">
      <center><h1> Device Path Finder</h1></center>
    <br/>
      <Container maxWidth="xl" style={{ height: "calc(100vh - 64px)" }}>
        <Grid container spacing={3} style={{ height: "100%" }}>
          <Grid item xs={12} md={8} lg={9} style={{ height: isMobile ? "50%" : "100%" }}>
            <div id="map" style={{ height: "80%", border: "2px solid black", borderRadius: "10px" }}></div>
          </Grid>
          <Grid item xs={12} md={4} lg={3} style={{ height: "100%", overflowY: "auto" }}>
            <div style={{ padding: "10px", backgroundColor: "#f4f4f4", borderLeft: "1px solid #ccc" }}>
              {errorMessage && <Typography color="error">{errorMessage}</Typography>}
              <Snackbar
                open={Boolean(snackbarMessage)}
                autoHideDuration={6000}
                onClose={() => setSnackbarMessage("")}
                message={snackbarMessage}
                action={
                  <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackbarMessage("")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              />
              <div className="date-control" style={{ marginTop: "20px" }}>
                {/* <Button variant="contained" color="primary" onClick={handleViewOnGMaps} fullWidth>
                  View on Google Maps
                </Button> */}
                <TextField
                  label="Start Date"
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={handleDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
                <TextField
                  label="End Date"
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={handleDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
                <RadioGroup
                  id="device-select"
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                >
                  {devices.length > 0 ? (
                    devices.map((device) => (
                      <FormControlLabel
                        key={device.deviceCode}
                        value={device.deviceName}
                        control={<Radio />}
                        label={device.nickname || device.deviceName}
                      />
                    ))
                  ) : (
                    <Typography color="error">No devices available. Please register a device.</Typography>
                  )}
                </RadioGroup>
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
};

export default LiveGPSTracker;