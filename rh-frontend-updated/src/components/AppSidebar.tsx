// rh-frontend-updated/src/components/AppSidebar.tsx

import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, // A better icon for the dashboard
  Users,
  Calendar,
  FileText,
  UserCheck,
  Clock,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslation } from 'react-i18next'; 

// Define the UserProfile type to be used as a prop
interface UserProfile {
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
}

interface AppSidebarProps {
  user: UserProfile | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation(); 

  const approverRoles = ['TEAM_LEADER', 'MANAGER', 'HR', 'DHR'];
  const hrRoles = ['HR', 'DHR'];
  
  // The navigation array is now built inside the component
  const navigation = [
    { title: t('sidebar.home'), url: "/", icon: LayoutDashboard },
    { title: t('sidebar.my_leave'), url: "/leave-request", icon: Clock },
    { title: t('schedule_page.title'), url: "/schedule", icon: Calendar },
    // Conditionally add the "Leave Management" link
    ...(user && approverRoles.includes(user.role) 
      ? [{ title: t('sidebar.leave_management'), url: "/leave-management", icon: UserCheck }] 
      : []),
    // Conditionally add the "Employees" link
    ...(user && hrRoles.includes(user.role) 
      ? [{ title: t('sidebar.employees'), url: "/employee", icon: Users }] 
      : []),
    { title: t('sidebar.documents'), url: "/documents", icon: FileText },
    // Conditionally add the "Company Settings" link
    ...(user && user.role === 'DHR' 
      ? [{ title: t('sidebar.settings'), url: "/company-settings", icon: Settings }] 
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={`${state === "collapsed" ? "w-16" : "w-64"} border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700`}>
      <SidebarContent>
        <div className="p-4">
          <div className={`flex items-center space-x-2 ${state === "collapsed" ? "justify-center" : ""}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            {state !== "collapsed" && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t('erpSystem')}</span>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            {t('navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive: linkIsActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.url) || linkIsCodeAccessible
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {state !== "collapsed" && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}