import { Outlet } from "react-router-dom";
import LandingFooter from "./components/LandingFooter";
import Header from "./components/Header";

const LandingLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gradient-to-r from-[rgb(255,230,230)] to-[rgb(230,230,255)] z-10">
        <Outlet />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
