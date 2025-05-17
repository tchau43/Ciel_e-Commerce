import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage.tsx";
import { Suspense } from "react";
import LandingPage from "./features/landing/pages/LandingPage.tsx";
import RegisterPage from "./features/auth/pages/RegisterPage.tsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.tsx";
import { Role } from "./types/dataTypes.ts";
import AdminDashBoardPage from "./features/admin/pages/AdminDashBoardPage.tsx";
import AdminUserManagementPage from "./features/admin/pages/AdminUserManagementPage.tsx";
import AdminLayout from "./features/admin/AdminLayout.tsx";
import CustomerLayout from "./features/customer/CustomerLayout.tsx";
import CustomerHomePage from "./features/customer/pages/CustomerHomePage.tsx";
import ProductsPage from "./features/products/pages/ProductsPage.tsx";
import CartPage from "./features/carts/pages/CartPage.tsx";
import PaymentPage from "./features/payment/pages/PaymentPage.tsx";
import StripePaymentPage from "./features/payment/pages/StripePaymentPage.tsx";
import InvoicePage from "./features/invoices/pages/InvoicePage.tsx";
import AdminProductsManagementPage from "./features/admin/pages/AdminProductsManagementPage.tsx";
import EditUser from "./features/admin/components/EditUser.tsx";
import EditProduct from "./features/admin/components/EditProduct.tsx";
import TestPage from "./features/pages/TestPage.tsx";
import Product from "./features/products/components/Product.tsx";
import RecommendedProductsPage from "./features/recommendations/pages/RecommendedProductsPage.tsx";
import AdminInvoicesManagementPage from "./features/admin/pages/AdminInvoicesManagementPage.tsx";
import { Toaster } from "sonner";
import CustomerReviewPage from "./features/review/pages/CustomerReviewPage.tsx";
import FaqPage from "./features/faq/pages/FaqPage";
import ChatWidget from "./components/chat/ChatWidget";

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
            <Route path="users/" element={<AdminUserManagementPage />} />
            <Route path="editUser/:id/" element={<EditUser />} />
            <Route path="products/" element={<AdminProductsManagementPage />} />
            <Route path="editProduct/:id/" element={<EditProduct />} />
            <Route path="invoices/" element={<AdminInvoicesManagementPage />} />
            {/* ADD THIS ROUTE */}
          </Route>

          {/* Route for user */}
          <Route
            path="/*"
            element={
              <RoleBasedRoute allowedRoles={[Role.CUSTOMER]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <CustomerLayout />
                  {/* <StripePayment /> */}
                </Suspense>
              </RoleBasedRoute>
            }
          >
            <Route index element={<CustomerHomePage />} />
            <Route
              path="products/*"
              element={
                // <Suspense fallback={<LoadingSpinner />}>
                <ProductsPage />
                // </Suspense>
              }
            ></Route>
            <Route path="product/:id/*" element={<Product />}></Route>
            <Route path="cart/" element={<CartPage />}></Route>
            <Route path="payment/" element={<PaymentPage />}></Route>
            <Route
              path="payment/stripe"
              element={<StripePaymentPage />}
            ></Route>
            <Route path="invoice/" element={<InvoicePage />}></Route>
            <Route
              path="recommendations/"
              element={<RecommendedProductsPage />}
            />
            <Route path="reviews/" element={<CustomerReviewPage />} />
            <Route path="faq/" element={<FaqPage />} />
            {/* <-- ADD ROUTE */}
          </Route>
          <Route path="test/" element={<TestPage />}></Route>
        </Routes>
        <Toaster position="top-right" richColors />
        <ChatWidget />
      </Suspense>
    </Router>
  );
}

export default App;
