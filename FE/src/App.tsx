import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.tsx";
import { Suspense } from "react";
import LandingPage from "./pages/LandingPage.tsx";
import RegisterPage from "./pages/auth/RegisterPage.tsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.tsx";
import { Role } from "./types/dataTypes.ts";
import AdminDashBoardPage from "./pages/admin/AdminDashBoardPage.tsx";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage .tsx";
import AdminLayout from "./components/layout/admin/AdminLayout.tsx";
import UserLayout from "./components/layout/user/UserLayout.tsx";
import UserHomePage from "./pages/user/UserHomePage.tsx";
import EditUserPage from "./pages/user/EditUserPage.tsx";
import ProductPage from "./pages/product/ProductPage.tsx";
import ProductDescription from "./components/product/ProductDescription.tsx";
import Product from "./components/product/Product.tsx";
import ProductMoreInfo from "./components/product/ProductMoreInfo.tsx";
import ProductWrapper from "./components/product/ProductWrapper.tsx";
import CartPage from "./pages/cart/CartPage.tsx";
import InvoicePage from "./pages/invoice/InvoicePage.tsx";

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
            <Route path="editUser/:id" element={<EditUserPage />} />
          </Route>

          {/* Route for user */}
          <Route
            path="/*"
            element={
              <RoleBasedRoute allowedRoles={[Role.CUSTOMER]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <UserLayout />
                </Suspense>
              </RoleBasedRoute>
            }
          >
            <Route index element={<UserHomePage />} />
            <Route
              path="product/*"
              element={
                // <Suspense fallback={<LoadingSpinner />}>
                <ProductPage />
                // </Suspense>
              }
            ></Route>
            <Route path="product/:id/*" element={<ProductWrapper />}>
              {/* <Route path="product/:id/*" element={<Product />} /> */}
              <Route index element={<ProductDescription />}></Route>
              <Route path="more" element={<ProductMoreInfo />}></Route>
            </Route>
            <Route path="cart/" element={<CartPage />}></Route>
            <Route path="invoice/" element={<InvoicePage />}></Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
