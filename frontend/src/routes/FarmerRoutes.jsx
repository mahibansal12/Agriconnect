// src/routes/FarmerRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/common/PrivateRoute';
import RoleRoute    from '../components/common/RoleRoute';

// ── Farmer pages ───────────────────────────────────────────────
import FarmerDashboard  from '../pages/dashboard/FarmerDashboard';
import AddListing       from '../pages/marketplace/AddListing';
import OrderForm        from '../pages/order/OrderForm';
import OrderDetail      from '../pages/order/OrderDetail';

// ── Wrappers ───────────────────────────────────────────────────

/** Convenience wrapper so we don't repeat PrivateRoute + RoleRoute every time */
const FarmerOnly = ({ children }) => (
  <PrivateRoute>
    <RoleRoute role="farmer">
      {children}
    </RoleRoute>
  </PrivateRoute>
);

// ── Route definitions ──────────────────────────────────────────

export default function FarmerRoutes() {
  return (
    <Routes>

      {/* /farmer/dashboard */}
      <Route
        path="dashboard"
        element={
          <FarmerOnly>
            <FarmerDashboard />
          </FarmerOnly>
        }
      />

      {/* /farmer/add-listing */}
      <Route
        path="add-listing"
        element={
          <FarmerOnly>
            <AddListing />
          </FarmerOnly>
        }
      />

      {/* /farmer/order — Razorpay order form (buyer initiates from marketplace, farmer views from dashboard) */}
      <Route
        path="order"
        element={
          <FarmerOnly>
            <OrderForm />
          </FarmerOnly>
        }
      />

     {/* /farmer/orders/:id — view a single order's full details */}
      <Route
        path="orders/:id"
        element={
          <FarmerOnly>
            <OrderDetail />
          </FarmerOnly>
        }
      />

      {/* /farmer/* → fallback */}
      <Route path="*" element={<Navigate to="/farmer/dashboard" replace />} />
    </Routes>
  );
}
