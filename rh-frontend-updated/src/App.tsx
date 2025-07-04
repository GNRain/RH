// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard';
import LeaveRequest from './pages/LeaveRequest';
import Schedule from './pages/Schedule';
import LeaveManagement from './pages/LeaveManagement';
import Employee from './pages/Employee';
import { Documents } from './pages/Documents';
import CompanySettings from './pages/CompanySettings';
import Profile from './pages/Profile';
import Security from './pages/Security';
import NotFound from "./pages/NotFound";
import { LoginPage } from './pages/LoginPage/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage/ResetPasswordPage';
import PrivateRoute from '@/components/PrivateRoute';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* AuthProvider now correctly wraps all routes without passing any props */}
          <AuthProvider>
            <SidebarProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Private Routes are now children of the PrivateRoute component */}
                <Route element={<PrivateRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/home" element={<Dashboard />} /> {/* Explicitly route /home */}
                    <Route path="leave-request" element={<LeaveRequest />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="leave-management" element={<LeaveManagement />} />
                    <Route path="employee" element={<Employee />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="company-settings" element={<CompanySettings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="security" element={<Security />} />
                  </Route>
                </Route>
                
                {/* Catch-all Not Found Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;