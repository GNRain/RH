
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LeaveRequest from "./pages/LeaveRequest";
import Schedule from "./pages/Schedule";
import LeaveManagement from "./pages/LeaveManagement";
import Employee from "./pages/Employee";
import Documents from "./pages/Documents";
import CompanySettings from "./pages/CompanySettings";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="leave-request" element={<LeaveRequest />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="leave-management" element={<LeaveManagement />} />
                  <Route path="employee" element={<Employee />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="company-settings" element={<CompanySettings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="security" element={<Security />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
