import React, { Suspense } from 'react'; // 👈 Import Suspense
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import the router
import { BrowserRouter } from 'react-router-dom';
import './i18n'; // Import the i18next configuration

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 👇 Wrap your app in a Suspense component */}
    <Suspense fallback="Loading...">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
);