// src/routes/BuyerRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy }          from 'react';
import PrivateRoute from '../components/common/PrivateRoute';
import RoleRoute    from '../components/common/RoleRoute';
import Loader       from '../components/common/Loader';


const BuyerDashboard = lazy(() =>
  import('../pages/dashboard/BuyerDashboard').catch(() => ({
    default: () => (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        BuyerDashboard coming soon…
      </div>
    ),
  }))
);

// Order form — buyer places an order
import OrderForm from '../../pages/order/OrderForm';

// ── Wrapper ────────────────────────────────────────────────────

const BuyerOnly = ({ children }) => (
  <PrivateRoute>
    <RoleRoute role="buyer">
      {children}
    </RoleRoute>
  </PrivateRoute>
);

// ── Route definitions ──────────────────────────────────────────

export default function BuyerRoutes() {
  return (
    <Routes>

      {/* /buyer/dashboard */}
      <Route
        path="dashboard"
        element={
          <BuyerOnly>
            <Suspense fallback={<Loader />}>
              <BuyerDashboard />
            </Suspense>
          </BuyerOnly>
        }
      />

      {/* /buyer/order — place a new order via Razorpay */}
      <Route
        path="order"
        element={
          <BuyerOnly>
            <OrderForm />
          </BuyerOnly>
        }
      />

      {/* /buyer/* → fallback */}
      <Route path="*" element={<Navigate to="/buyer/dashboard" replace />} />
    </Routes>
  );
}
