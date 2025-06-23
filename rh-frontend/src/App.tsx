import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { HomePage } from './pages/HomePage/HomePage';
import { LeavePage } from './pages/LeavePage/LeavePage';
import { DocumentsPage } from './pages/DocumentsPage/DocumentsPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { LeaveManagementPage } from './pages/LeaveManagementPage/LeaveManagementPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';
import { EmployeesPage } from './pages/EmployeesPage/EmployeesPage';
import { CompanySettingsPage } from './pages/CompanySettingsPage/CompanySettingsPage'; // --- NEW IMPORT ---

import './App.css'; 

const API_URL = 'http://localhost:3000';

interface DecodedToken {
  sub: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
}

interface UserProfile {
  name: string;
  department: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
}

function App() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          jwtDecode<DecodedToken>(token);
          setIsAuthenticated(true);
          const { data } = await axios.get(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          setUser({ name: data.name, department: data.department.name, role: data.role });
        } catch (error) { localStorage.removeItem('access_token'); }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        setIsAuthenticated(true);
        const { data } = await axios.get(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        setUser({ name: data.name, department: data.department.name, role: data.role });
        navigate('/home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const approverRoles = ['TEAM_LEADER', 'MANAGER', 'HR', 'DHR'];
  const hrRoles = ['HR', 'DHR'];

  const navItems = [
    { path: '/home', label: t('sidebar.home') },
    { path: '/leave', label: t('sidebar.my_leave') },
    ...(user && approverRoles.includes(user.role) ? [{ path: '/leave-management', label: t('sidebar.leave_management') }] : []),
    ...(user && hrRoles.includes(user.role) ? [{ path: '/employees', label: t('sidebar.employees') }] : []),
    { path: '/documents', label: t('sidebar.documents') },
    // --- NEW: Conditionally show Settings for DHR, replacing old Profile link ---
    ...(user && user.role === 'DHR' ? [{ path: '/settings', label: t('sidebar.settings') }] : []),
  ];

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
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
      <Sidebar navItems={navItems} />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        <main className="page-content-container">
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/leave" element={<LeavePage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {user && approverRoles.includes(user.role) && <Route path="/leave-management" element={<LeaveManagementPage />} />}
            {user && hrRoles.includes(user.role) && <Route path="/employees" element={<EmployeesPage />} />}
            {/* --- NEW: Protected route for settings page --- */}
            {user && user.role === 'DHR' && <Route path="/settings" element={<CompanySettingsPage />} />}

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;