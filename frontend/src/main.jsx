import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

const rootEl = document.getElementById('root');
createRoot(rootEl).render(
  //   <StrictMode>
  <BrowserRouter>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </BrowserRouter>
  //   </StrictMode>
);
