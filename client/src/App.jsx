import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/Toast';

import { PublicLayout, DashboardLayout, AuthLayout } from './layouts';
import { ProtectedRoute } from './components';

import {
  HomePage,
  LoginPage,
  RegisterPage,
  StoresPage,
  StoreDetailsPage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  OrderTrackerPage,
  PartnerDashboardPage,
  PartnerInventoryPage,
  PartnerOrdersPage,
  AdminDashboardPage,
  AdminTransactionsPage,
  AdminZonesPage,
  AdminUsersPage,
  DeliveryTasksPage,
  ForbiddenPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
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
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
