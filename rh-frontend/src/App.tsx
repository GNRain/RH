// src/App.tsx

import { useState, useEffect, useRef} from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Aurora from './components/Aurora/Aurora';
import Dock from './components/Dock/Dock';
import { VscBell, VscHome, VscCalendar, VscArchive, VscAccount, VscSettingsGear, VscFilePdf, VscChecklist } from 'react-icons/vsc';
import { HiOutlineLogout } from "react-icons/hi";

import { LoginPage } from './pages/LoginPage/LoginPage';
import { HomePage } from './pages/HomePage/HomePage';
import { LeavePage } from './pages/LeavePage/LeavePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';
import { LeaveManagementPage } from './pages/LeaveManagementPage/LeaveManagementPage';
import { NotificationDropdown } from './components/NotificationDropdown/NotificationDropdown';

import logoImage from './assets/logo.png';
import './App.css'; 
import { DocumentsPage } from './pages/DocumentsPage/DocumentsPage';
import { jwtDecode } from 'jwt-decode';

// --- Define a type for our decoded token payload ---
interface DecodedToken {
  sub: string;
  cin: string;
  department: 'HR' | 'IT' | 'Business' | 'Management';
  iat: number;
  exp: number;
}

const useOutsideClick = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, callback]);
};

function App() {
  // We add a `loading` state to prevent a "flash" of the login page on refresh
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);

  
  // --- NEW STATE & REF FOR DROPDOWN ---
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // --- Close dropdown when clicking outside ---
  useOutsideClick(notificationRef, () => {
    if (isNotificationOpen) {
        setIsNotificationOpen(false);
    }
  });

  const navigate = useNavigate();

 useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        // Check if token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUserDepartment(decodedToken.department);
        } else {
          // Token is expired
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false); 
  }, []);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        const decodedToken = jwtDecode<DecodedToken>(token);
        setIsAuthenticated(true);
        setUserDepartment(decodedToken.department);
        navigate('/home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUserDepartment(null); // Clear department on logout
    navigate('/login');
  };

  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => navigate('/home') },
    { icon: <VscCalendar size={18} />, label: 'My Leave', onClick: () => navigate('/leave') },
    // --- Conditionally add the HR-only link ---
    ...(userDepartment === 'HR'
      ? [{ icon: <VscChecklist size={18} />, label: 'Leave Mgmt', onClick: () => navigate('/leave-management') }]
      : []),
    { icon: <VscFilePdf size={18} />, label: 'Documents', onClick: () => navigate('/documents') },
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
        <div ref={notificationRef}>
          <div className="top-right-controls">
            <button 
              onClick={() => setIsNotificationOpen(prev => !prev)} 
              className="notification-button" 
              title="Notifications"
            >
              <VscBell size={22} />
            </button>
            <button onClick={handleLogout} className="logout-button" title="Logout">
              <HiOutlineLogout size={22} />
            </button>
          </div>
          
          <Dock items={dockItems} panelHeight={60} baseItemSize={48} magnification={60} />

          {isNotificationOpen && <NotificationDropdown />}
        </div>
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

          {/* ROUTE 4: Reset Password Page (Unprotected) */}
          <Route
            path="/reset-password"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <ResetPasswordPage />}
          />
          
          {/* ROUTE 5: Catch-all */}
          {/* Any other URL will redirect to /home if logged in, otherwise to /login */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
          />
          {/* ROUTE 6: Documents Page (Protected) */}
          {/* If you are not logged in, you are redirected to /login */}
          <Route path="/documents" element={isAuthenticated ? <DocumentsPage /> : <Navigate to="/login" replace />} />
          
          {/* ROUTE 7: Profile Page (Protected) */}
          {/* If you are not logged in, you are redirected to /login */}  

          <Route 
            path="/leave-management" 
            element={isAuthenticated && userDepartment === 'HR' ? <LeaveManagementPage /> : <Navigate to="/home" replace />} 
          />

        </Routes>
      </main>
    </div>
  );
}

export default App;