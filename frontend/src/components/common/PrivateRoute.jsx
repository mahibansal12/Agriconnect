// src/components/common/PrivateRoute.jsx
// Wrap any route that requires the user to be logged in.
// Usage in AppRoutes.jsx:
//   <Route path="/farmer/dashboard" element={<PrivateRoute><FarmerDashboard /></PrivateRoute>} />
 
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
 
export default function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
 
  // Still loading user from localStorage — show nothing yet
  if (loading) return null;
 
  if (!isLoggedIn) {
    // Remember where they were trying to go so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
 
  return children;
}
 