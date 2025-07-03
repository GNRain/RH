import React, { createContext, useContext, ReactNode } from 'react';

// Define the shape of the user profile and the context
interface UserProfile {
  name: string;
  department: string;
  role: 'EMPLOYEE' | 'TEAM_LEADER' | 'MANAGER' | 'HR' | 'DHR';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;isLoading: boolean; // 👈 ADD THIS
  onLogout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
interface AuthProviderProps {
  children: ReactNode;
  value: AuthContextType;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, value }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};