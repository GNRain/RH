// src/components/Layout.tsx

import { Outlet, useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, Globe, User, Shield, LogOut } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  // --- THIS IS THE FIX ---
  // The context provides a function named 'logout', not 'onLogout'
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
      <AppSidebar user={user} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-6 shadow-sm">
          <SidebarTrigger className="mr-4" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{t('erpSystem')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="en">EN</SelectItem>
                      <SelectItem value="fr">FR</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('header.greeting', { name: user?.name })}</div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                    {user?.name?.charAt(0)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('sidebar.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/security')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{t('security')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                <DropdownMenuItem 
                  // --- THIS IS THE FIX ---
                  onClick={logout} 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;