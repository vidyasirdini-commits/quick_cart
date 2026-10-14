import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';

import { PublicLayout, DashboardLayout, AuthLayout } from './layouts';
import { ProtectedRoute } from './components';

// Code-split dynamic page imports with React.lazy
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const StoresPage = React.lazy(() => import('./pages/StoresPage'));
const StoreDetailsPage = React.lazy(() => import('./pages/StoreDetailsPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const OrderTrackerPage = React.lazy(() => import('./pages/OrderTrackerPage'));
const PartnerDashboardPage = React.lazy(() => import('./pages/PartnerDashboardPage'));
const PartnerInventoryPage = React.lazy(() => import('./pages/PartnerInventoryPage'));
const PartnerOrdersPage = React.lazy(() => import('./pages/PartnerOrdersPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage'));
const AdminTransactionsPage = React.lazy(() => import('./pages/AdminTransactionsPage'));
const AdminZonesPage = React.lazy(() => import('./pages/AdminZonesPage'));
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage'));
const DeliveryTasksPage = React.lazy(() => import('./pages/DeliveryTasksPage'));
const ForbiddenPage = React.lazy(() => import('./pages/ForbiddenPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Accessible route loading fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8" role="status" aria-label="Loading page">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-500">Loading QuickCart...</span>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public & Customer Storefront Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/stores" element={<StoresPage />} />
                <Route path="/stores/:id" element={<StoreDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Customer Protected */}
                <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderTrackerPage />} />
                </Route>

                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/404" element={<NotFoundPage />} />
              </Route>

              {/* Authentication Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Store Partner Dashboard */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['partner', 'admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
                <Route path="/partner/inventory" element={<PartnerInventoryPage />} />
                <Route path="/partner/orders" element={<PartnerOrdersPage />} />
              </Route>

              {/* Administrator Dashboard */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
                <Route path="/admin/zones" element={<AdminZonesPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>

              {/* Delivery Executive Dashboard */}
              <Route
                element={
                  <ProtectedRoute allowedRoles={['delivery', 'admin']}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/delivery/tasks" element={<DeliveryTasksPage />} />
              </Route>

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </React.Suspense>
        </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
