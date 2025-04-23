import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthCredentials } from "../../utils/authUtil";
import Header from "./components/Header";
import { Role } from "../../types/dataTypes";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const CustomerLayout: React.FC = () => {
  const { token, role } = getAuthCredentials();

  if (!token || role !== Role.CUSTOMER) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-full w-full items-center p-0 bg-ch-red-10">
      {/* <Topbar></Topbar> */}
      <Header />
      <Navbar />
      <div className="p-4 flex bg-primary-foreground w-full flex-1 justify-center items-start">
        <div className="min-h-full w-full max-w-10xl">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
