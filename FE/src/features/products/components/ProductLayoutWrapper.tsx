import { Navigate } from "react-router-dom";
import { getAuthCredentials } from "@/utils/authUtil";
import CustomerLayout from "@/features/customer/CustomerLayout";
import LandingLayout from "@/features/landing/LandingLayout";

const ProductLayoutWrapper = () => {
  const { userInfo } = getAuthCredentials();

  // If user is authenticated, use CustomerLayout
  if (userInfo?._id) {
    return <CustomerLayout />;
  }

  // If not authenticated, use LandingLayout
  return <LandingLayout />;
};

export default ProductLayoutWrapper;
