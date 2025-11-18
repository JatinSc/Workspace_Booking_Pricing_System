import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

// Application entry point.
// Mounts React app, initializes BrowserRouter, and configures toast notifications.
const rootEl = document.getElementById('root');
createRoot(rootEl).render(
  <BrowserRouter>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </BrowserRouter>
);
