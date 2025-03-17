import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect them to the sign-in page if not authenticated
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

export default ProtectedRoute; 