// src/routes/AdminRoutes.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy }          from 'react';
import PrivateRoute from '../../components/common/PrivateRoute';
import RoleRoute    from '../../components/common/RoleRoute';
import Loader       from '../../components/common/Loader';


const AdminDashboard = lazy(() =>
  import('../../pages/dashboard/AdminDashboard').catch(() => ({
    default: () => (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        AdminDashboard coming soon…
      </div>
    ),
  }))
);

// ── Wrapper ────────────────────────────────────────────────────

const AdminOnly = ({ children }) => (
  <PrivateRoute>
    <RoleRoute role="admin">
      {children}
    </RoleRoute>
  </PrivateRoute>
);

// ── Route definitions ──────────────────────────────────────────

export default function AdminRoutes() {
  return (
    <Routes>

      {/* /admin/dashboard */}
      <Route
        path="dashboard"
        element={
          <AdminOnly>
            <Suspense fallback={<Loader />}>
              <AdminDashboard />
            </Suspense>
          </AdminOnly>
        }
      />

      {/* Future admin routes go here:
          /admin/users       → manage users
          /admin/news/new    → create news article
          /admin/schemes/new → add govt scheme
          /admin/listings    → moderate crop listings
      */}

      {/* /admin/* → fallback */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
