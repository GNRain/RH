// src/App.tsx

import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Aurora from './components/Aurora/Aurora';
import Dock from './components/Dock/Dock';
import { VscHome, VscCalendar, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc';
import { HiOutlineLogout } from "react-icons/hi";

import { LoginPage } from './pages/LoginPage/LoginPage';
import { HomePage } from './pages/HomePage/HomePage';
import { LeavePage } from './pages/LeavePage/LeavePage';

import logoImage from './assets/logo.png';
import './App.css'; 

function App() {
  // We add a `loading` state to prevent a "flash" of the login page on refresh
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // --- THIS IS THE FIX FOR PERSISTENT LOGIN ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // If a token is found in storage, we consider the user logged in
      setIsAuthenticated(true);
    }
    // After checking, we are no longer in a loading state
    setIsLoading(false); 
  }, []); // The empty array ensures this effect runs only once when the app starts

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => navigate('/home') },
    { icon: <VscCalendar size={18} />, label: 'Leave', onClick: () => navigate('/leave') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => navigate('/archive') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => navigate('/profile') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => navigate('/settings') },
    
  ];
  
  // While we check for the token, it's best to render nothing to avoid visual glitches
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="app-container">
      <div className="app-background">
        <Aurora />
      </div>

      <img src={logoImage} alt="Application Logo" className="app-logo" />

      {/* Conditionally render the Logout button and Dock */}
      {isAuthenticated && (
        <>
          <button onClick={handleLogout} className="logout-button" title="Logout">
            <HiOutlineLogout size={22} />
          </button>
          <Dock 
            items={dockItems}
            panelHeight={60}
            baseItemSize={48}
            magnification={60}
          />
        </>
      )}

      <main className="page-content">
        <Routes>
          {/* ROUTE 1: Login Page */}
          {/* If you are logged in and try to go to /login, you are redirected to /home */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
          />

          {/* ROUTE 2: Home Page (Protected) */}
          {/* If you are not logged in, you are redirected to /login */}
          <Route
            path="/home"
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
          />
          
          {/* ROUTE 3: Leave Page (Protected) */}
          {/* If you are not logged in, you are redirected to /login */}
          <Route
            path="/leave"
            element={isAuthenticated ? <LeavePage /> : <Navigate to="/login" replace />}
          />
          
          {/* ROUTE 4: Catch-all */}
          {/* Any other URL will redirect to /home if logged in, otherwise to /login */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;