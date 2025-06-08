import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './Loading';

const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Check for auth cookie in localStorage
  const authCookie = localStorage.getItem('token');
  
  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated && !authCookie) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 