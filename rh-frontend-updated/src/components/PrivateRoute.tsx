import { Navigate, Outlet } from 'react-router-dom';

interface PrivateRouteProps {
  isAuthenticated: boolean;
}

export const PrivateRoute = ({ isAuthenticated }: PrivateRouteProps) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};