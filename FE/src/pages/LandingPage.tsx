import { Outlet } from "react-router-dom";
import Header from "../components/layout/home/Header";

const LandingPage: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default LandingPage;
