import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage.tsx";
import { Suspense } from "react";
import LandingPage from "./features/landing/pages/LandingPage.tsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.tsx";
import { Role } from "./types/dataTypes.ts";
import AdminDashBoardPage from "./features/admin/pages/AdminDashBoardPage.tsx";
import AdminUserManagementPage from "./features/admin/pages/AdminUserManagementPage.tsx";
import AdminLayout from "./features/admin/AdminLayout.tsx";
import AdminProductsManagementPage from "./features/admin/pages/AdminProductsManagementPage.tsx";
import EditUser from "./features/admin/components/EditUser.tsx";
import EditProduct from "./features/admin/components/EditProduct.tsx";
import AdminInvoicesManagementPage from "./features/admin/pages/AdminInvoicesManagementPage.tsx";
import { Toaster } from "sonner";

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
          {/* Route for LandingPage, Login, Register - not require authenticated */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Route for admin */}
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
            <Route path="users/" element={<AdminUserManagementPage />} />
            <Route path="editUser/:id/" element={<EditUser />} />
            <Route path="products/" element={<AdminProductsManagementPage />} />
            <Route path="editProduct/:id/" element={<EditProduct />} />
            <Route path="invoices/" element={<AdminInvoicesManagementPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </Suspense>
    </Router>
  );
}

export default App;
