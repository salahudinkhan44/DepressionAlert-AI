// Route guards. Protected routes require an authenticated session
// (SRS SEC-4); PublicOnly redirects logged-in users into the app.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg" /></div>;
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'Authorized Viewer' ? '/viewer' : '/dashboard'} replace />;
  }
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="loading-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg" /></div>;
  }
  if (user) return <Navigate to={user.role === 'Authorized Viewer' ? '/viewer' : '/dashboard'} replace />;
  return <Outlet />;
}
