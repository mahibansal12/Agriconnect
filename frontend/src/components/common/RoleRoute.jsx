// src/components/common/RoleRoute.jsx
// Wrap role-specific routes to block wrong users.
// Usage in AppRoutes.jsx:
//   <Route path="/farmer/dashboard"
//     element={<PrivateRoute><RoleRoute role="farmer"><FarmerDashboard /></RoleRoute></PrivateRoute>}
//   />
 
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
 
export default function RoleRoute({ role, children }) {
  const { user, loading } = useAuth();
 
  if (loading) return null;
 
  if (!user || user.role !== role) {
    // Redirect to their correct dashboard instead of a blank error
    const redirect =
      user?.role === "farmer" ? "/farmer/dashboard" :
      user?.role === "buyer"  ? "/buyer/dashboard"  :
      user?.role === "admin"  ? "/admin/dashboard"  : "/login";
 
    return <Navigate to={redirect} replace />;
  }
 
  return children;
}
 