import Header from "@/features/landing/components/Header";
import { Outlet } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default LandingPage;
