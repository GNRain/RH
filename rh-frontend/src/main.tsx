// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import the router
import { BrowserRouter } from 'react-router-dom';
import './i18n'; // Import the i18next configuration

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap our App with the router to enable navigation */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);