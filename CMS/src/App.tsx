import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage.tsx";
import { Suspense } from "react";
import LandingPage from "./features/landing/pages/LandingPage.tsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.tsx";
import { Role } from "./types/dataTypes.ts";
import AdminDashBoardPage from "./features/admin/pages/AdminDashBoardPage.tsx";
import UserManagementPage from "./features/user/pages/UserManagementPage.tsx";
import AdminLayout from "./features/admin/AdminLayout.tsx";
import ProductsManagementPage from "./features/product/pages/ProductsManagementPage.tsx";
import EditProduct from "./features/product/components/EditProduct.tsx";
import CreateProduct from "./features/product/components/CreateProduct.tsx";
import InvoicesManagementPage from "./features/invoice/pages/InvoicesManagementPage.tsx";
import { Toaster } from "sonner";
import EditUserPage from "./features/user/pages/EditUserPage.tsx";
import CouponsManagementPage from "./features/coupon/pages/CouponsManagementPage.tsx";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/*"
            element={
              <RoleBasedRoute allowedRoles={[Role.ADMIN]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminLayout />
                </Suspense>
              </RoleBasedRoute>
            }
          >
            <Route index element={<AdminDashBoardPage />} />
            <Route path="users/" element={<UserManagementPage />} />
            <Route path="editUser/:id/" element={<EditUserPage />} />
            <Route path="products/" element={<ProductsManagementPage />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route path="editProduct/:id/" element={<EditProduct />} />
            <Route path="invoices/" element={<InvoicesManagementPage />} />
            <Route path="coupons/" element={<CouponsManagementPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </Suspense>
    </Router>
  );
}

export default App;
