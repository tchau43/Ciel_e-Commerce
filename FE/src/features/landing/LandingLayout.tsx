import { Outlet } from "react-router-dom";
import LandingFooter from "./components/LandingFooter";
import Header from "./components/Header";

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
