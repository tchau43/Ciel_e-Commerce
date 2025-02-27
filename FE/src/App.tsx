import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/landing/LoginPage.tsx";
import { Suspense } from "react";
import LandingPage from "./pages/landing/LandingPage.tsx";
import RegisterPage from "./pages/landing/RegisterPage.tsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.tsx";
import { Role } from "./types/dataTypes.ts";
import AdminDashBoardPage from "./pages/admin/AdminDashBoardPage.tsx";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage .tsx";
import AdminLayout from "./components/layout/admin/AdminLayout.tsx";
import UserLayout from "./components/layout/user/UserLayout.tsx";

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
          <Route path="/register" element={<RegisterPage />} />

          {/* Route for admin */}
          <Route
            path="/admin/*"
            element={
              <RoleBasedRoute allowedRoles={[Role.ADMIN]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminLayout />
                </Suspense>
              </RoleBasedRoute>
            }
          >
            <Route index element={<AdminDashBoardPage />} />
            <Route path="users" element={<AdminUserManagementPage />} />
          </Route>

          {/* Route for user */}
          <Route
            path="/*"
            element={
              <RoleBasedRoute allowedRoles={[Role.USER]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <UserLayout />
                </Suspense>
              </RoleBasedRoute>
            }
          >
            <Route index element={<AdminDashBoardPage />} />
            <Route path="users" element={<AdminUserManagementPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
