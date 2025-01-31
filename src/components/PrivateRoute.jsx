import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ element: Element, ...rest }) {
  const { user } = useAuth();

  // If the user is not authenticated, redirect to login page
  return user ? Element : <Navigate to="/login" />;
}

export default PrivateRoute;
