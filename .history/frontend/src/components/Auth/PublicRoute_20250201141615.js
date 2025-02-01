import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { auth } = useAuth();
  
  if (auth.token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
};

export default PublicRoute;