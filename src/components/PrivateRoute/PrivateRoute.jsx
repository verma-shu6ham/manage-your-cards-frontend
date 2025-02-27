import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';

function PrivateRoute({ element: Element, ...rest }) {
  const { user } = useAuth();
  // console.log(user)

  // If the user is not authenticated, redirect to login page
  return user ? Element : <Navigate to="/login" />;
}

export default PrivateRoute;
