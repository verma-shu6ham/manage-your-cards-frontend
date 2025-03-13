import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

function PrivateRoute({ element: Element, ...rest }) {
  const { user } = useAuth();

  return user ? Element : <Navigate to="/login" />;
}

export default withErrorBoundary(PrivateRoute);
