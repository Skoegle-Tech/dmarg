import { createRoot } from 'react-dom/client';
import { StoreProvider } from "./Store/Store.jsx";
import App from './App.jsx';
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <StoreProvider> {/* Ensure StoreProvider wraps App if needed */}
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StoreProvider>
  </HelmetProvider>
);