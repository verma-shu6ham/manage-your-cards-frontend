import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { withErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { useEffect, useState } from 'react';

function PublicRoute({ element: Element, ...rest }) {
  const { user } = useAuth();
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setShouldRender(true);
    }
  }, [user, location.pathname]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return shouldRender ? Element : null;
}

export default withErrorBoundary(PublicRoute);
