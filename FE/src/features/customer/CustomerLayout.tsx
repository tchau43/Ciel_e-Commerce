import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthCredentials } from "../../utils/authUtil";
import Header from "./components/Header";
import { Role } from "../../types/dataTypes";
// import Topbar from "./components/Topbar"; // Bỏ comment nếu bạn dùng Topbar
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
        {/* <Topbar /> */}
        <Header />
        {/* Vùng nội dung chính: flex-1 sẽ đẩy Footer xuống */}
        <div className="flex w-full flex-1 justify-center items-start">
          {/* Bỏ p-4 ở đây nếu muốn padding chỉ áp dụng cho content bên trong */}
          {/* Container giới hạn chiều rộng nội dung */}
          <div className="min-h-full w-full max-w-screen-2xl p-4">
            {/* Thêm p-4 vào đây */}
            <Outlet />
          </div>
        </div>
        {/* Footer sẽ được đẩy xuống dưới cùng */}
        <Footer />
      </div>
    </NavbarWrapper>
  );
};

export default CustomerLayout;
