import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// --- CORE LAYOUT COMPONENTS ---
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';

// --- PAGE COMPONENTS ---
import { LoginPage } from './pages/LoginPage/LoginPage';
import { HomePage } from './pages/HomePage/HomePage';
import { LeavePage } from './pages/LeavePage/LeavePage';
import { DocumentsPage } from './pages/DocumentsPage/DocumentsPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { LeaveManagementPage } from './pages/LeaveManagementPage/LeaveManagementPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';
import { EmployeesPage } from './pages/EmployeesPage/EmployeesPage';

// --- STYLES ---
import './App.css'; 

const API_URL = 'http://localhost:3000';

interface DecodedToken {
  sub: string;
  cin: string;
  department: 'HR' | 'IT' | 'Business' | 'Management';
}

interface UserProfile {
    name: string;
    department: string;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          if (decodedToken.exp * 1000 > Date.now()) {
            setIsAuthenticated(true);
            // Fetch user data for header and sidebar
            const response = await axios.get(`${API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
          } else {
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          localStorage.removeItem('access_token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        setIsAuthenticated(true);
        const response = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        navigate('/home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/leave', label: 'My Leave' },
    ...(user?.department === 'HR'
      ? [
          { path: '/leave-management', label: 'Leave Management' },
          { path: '/employees', label: 'Employees' },
        ]
      : []),
    { path: '/documents', label: 'Documents' },
    { path: '/profile', label: 'Profile' },
  ];

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F9F9F9' }}>
        <Routes>
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="sidebar-container">
        <Sidebar navItems={navItems} />
      </div>

      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="page-content-container">
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {user?.department === 'HR' && (
              <Route path="/leave-management" element={<LeaveManagementPage />} 
              />       
            )}
            {user?.department === 'HR' && (
              <Route path="/employees" element={<EmployeesPage />} />
            )}
            
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;