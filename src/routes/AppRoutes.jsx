import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AdminStoreProvider } from "../contexts/AdminStoreContext";
import { AuthProvider } from "../contexts/AuthContext";
import { StoreProvider } from "../contexts/StoreContext";

import ProtectedAdminRoute from "../components/auth/ProtectedAdminRoute";
import AdminLayout from "../layouts/AdminLayout";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AcceptInvitePage from "../pages/auth/AcceptInvitePage";
import ProductsPage from "../pages/admin/ProductsPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import OrdersPage from "../pages/admin/OrdersPage";
import SettingsPage from "../pages/admin/SettingsPage";
import ReviewsPage from "../pages/admin/ReviewsPage";
import StoreSettingsPage from "../pages/admin/StoreSettingsPage";

import App from "../App";
import UsersPage from "../pages/admin/UsersPage";
import ProductDetailsPage from "../pages/admin/ProductDetailsPage";

const queryClient = new QueryClient();

function StoreLayout() {
  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  );
}

function AdminStoreLayout() {
  return (
    <AdminStoreProvider>
      <Outlet />
    </AdminStoreProvider>
  );
}

export default function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/auth/accept-invite" element={<AcceptInvitePage />} />

            <Route element={<ProtectedAdminRoute />}>
              <Route element={<AdminStoreLayout />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />

                  <Route path="products" element={<ProductsPage />} />

                  <Route path="products/new" element={<ProductDetailsPage />} />

                  <Route
                    path="products/:productId"
                    element={<ProductDetailsPage />}
                  />

                  <Route path="categories" element={<CategoriesPage />} />

                  <Route path="orders" element={<OrdersPage />} />

                  <Route
                    path="store-settings"
                    element={<StoreSettingsPage />}
                  />

                  <Route path="reviews" element={<ReviewsPage />} />

                  <Route path="users" element={<UsersPage />} />

                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/:storeSlug" element={<StoreLayout />}>
              <Route index element={<App />} />
            </Route>

            <Route path="/" element={<StoreLayout />}>
              <Route index element={<App />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
