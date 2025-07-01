import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthCredentials } from "../../utils/authUtil";
import Header from "./components/Header";
import { Role } from "../../types/dataTypes";
// import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import NavbarWrapper from "./components/Navbar";

const CustomerLayout: React.FC = () => {
  const { token, role } = getAuthCredentials();

  if (!token || role !== Role.CUSTOMER) {
    return <Navigate to="/login" replace />;
  }

  return (
    <NavbarWrapper>
      <div className="flex flex-col min-h-screen w-full items-center">
        <Header />
        <div className="flex w-full flex-1 justify-center items-start">
          <div className="min-h-full w-full max-w-screen-2xl p-4 pt-24">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    </NavbarWrapper>
  );
};

export default CustomerLayout;
