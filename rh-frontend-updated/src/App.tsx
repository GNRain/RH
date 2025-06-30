import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import LeaveRequest from './pages/LeaveRequest';
import Schedule from './pages/Schedule';
import LeaveManagement from './pages/LeaveManagement';
import Employee from './pages/Employee';
import Documents from './pages/Documents';
import CompanySettings from './pages/CompanySettings';
import Profile from './pages/Profile';
import Security from './pages/Security';
import NotFound from "./pages/NotFound";
import { LoginPage } from './pages/LoginPage/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';
import { PrivateRoute } from '@/components/PrivateRoute';
import API_URL from './config';

const queryClient = new QueryClient();

interface DecodedToken {
  sub: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
}

interface UserProfile {
  name: string;
  department: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
}

const App = () => {
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
        navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (isLoading) return null;

  const approverRoles = ['TEAM_LEADER', 'MANAGER', 'HR', 'DHR'];
  const hrRoles = ['HR', 'DHR'];

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SidebarProvider>
            <Routes>
              <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
                <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
                  <Route index element={<Dashboard />} />
                  <Route path="leave-request" element={<LeaveRequest />} />
                  <Route path="schedule" element={<Schedule />} />
                  {user && approverRoles.includes(user.role) && <Route path="leave-management" element={<LeaveManagement />} />}
                  {user && hrRoles.includes(user.role) && <Route path="employee" element={<Employee />} />}
                  <Route path="documents" element={<Documents />} />
                  {user && user.role === 'DHR' && <Route path="company-settings" element={<CompanySettings />} />}
                  <Route path="profile" element={<Profile />} />
                  <Route path="security" element={<Security />} />
                </Route>
              </Route>
              <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="*" element={isAuthenticated ? <NotFound /> : <Navigate to="/login" />} />
            </Routes>
          </SidebarProvider>
        </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
)};

export default App;