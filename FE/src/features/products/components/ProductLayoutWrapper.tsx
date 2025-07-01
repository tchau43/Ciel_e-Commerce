import { getAuthCredentials } from "@/utils/authUtil";
import CustomerLayout from "@/features/customer/CustomerLayout";
import LandingLayout from "@/features/landing/LandingLayout";

const ProductLayoutWrapper = () => {
  const { userInfo } = getAuthCredentials();

  if (userInfo?._id) {
    return <CustomerLayout />;
  }

  return <LandingLayout />;
};

export default ProductLayoutWrapper;
