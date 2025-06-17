import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense } from "react";
import LandingPage from "./features/landing/pages/LandingPage.tsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.tsx";
import { Role } from "./types/dataTypes.ts";
import CustomerLayout from "./features/customer/CustomerLayout.tsx";
import CustomerHomePage from "./features/customer/pages/CustomerHomePage.tsx";
import ProductsPage from "./features/products/pages/ProductsPage.tsx";
import CartPage from "./features/carts/pages/CartPage.tsx";
import CheckoutPage from "./features/payment/pages/CheckoutPage.tsx";
import StripePaymentPage from "./features/payment/pages/StripePaymentPage.tsx";
import InvoicePage from "./features/invoices/pages/InvoicePage.tsx";
import TestPage from "./features/pages/TestPage.tsx";
import Product from "./features/products/components/Product.tsx";
import RecommendedProductsPage from "./features/recommendations/pages/RecommendedProductsPage.tsx";
import { Toaster } from "sonner";
import CustomerReviewPage from "./features/review/pages/CustomerReviewPage.tsx";
import FaqPage from "./features/faq/pages/FaqPage";
import ChatWidget from "./components/chat/ChatWidget";
import AuthPage from "./features/auth/pages/AuthPage.tsx";
import LandingLayout from "./features/landing/LandingLayout.tsx";
import ProductLayoutWrapper from "./features/products/components/ProductLayoutWrapper.tsx";
import TestPage2 from "./features/pages/TestPage2.tsx";
import Profile from "./features/customer/pages/Profile.tsx";
import PaymentPage from "./features/payment/pages/PaymentPage.tsx";

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
          {/* Redirect root to landing page */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* Public routes with LandingLayout */}
          <Route element={<LandingLayout />}>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Route>

          {/* Product routes with dynamic layout */}
          <Route element={<ProductLayoutWrapper />}>
            <Route path="/products/*" element={<ProductsPage />} />
            <Route path="/product/:id/*" element={<Product />} />
          </Route>

          {/* Protected customer routes */}
          <Route
            path="/*"
            element={
              <RoleBasedRoute allowedRoles={[Role.CUSTOMER]}>
                <Suspense fallback={<LoadingSpinner />}>
                  <CustomerLayout />
                </Suspense>
              </RoleBasedRoute>
            }
          >
            <Route index element={<CustomerHomePage />} />
            <Route path="cart/" element={<CartPage />} />
            <Route path="checkout/" element={<CheckoutPage />} />
            <Route path="payment/" element={<PaymentPage />} />
            <Route path="payment/stripe" element={<StripePaymentPage />} />
            <Route path="invoice/" element={<InvoicePage />} />
            <Route path="profile/" element={<Profile />} />
            <Route
              path="recommendations/"
              element={<RecommendedProductsPage />}
            />
            <Route path="reviews/" element={<CustomerReviewPage />} />
            <Route path="faq/" element={<FaqPage />} />
          </Route>

          {/* Test route */}
          <Route path="test/:id" element={<TestPage />} />
          <Route path="test2/:id" element={<TestPage2 />} />
        </Routes>
        <Toaster position="top-right" richColors />
        <ChatWidget />
      </Suspense>
    </Router>
  );
}

export default App;
