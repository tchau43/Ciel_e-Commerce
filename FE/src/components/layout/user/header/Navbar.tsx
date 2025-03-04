import React from "react";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <>
      <div className="space-x-8 m-0">
        <NavLink
          className="text-sm font-medium text-gray-700 hover:text-[rgba(213,106,54,1)]"
          to={"/"}
        >
          TRANG CHỦ
        </NavLink>
        <NavLink
          className="text-sm font-medium text-gray-700 hover:text-[rgba(213,106,54,1)]"
          to={"/company"}
        >
          GIỚI THIỆU CÔNG TY
        </NavLink>
        <NavLink
          className="text-sm font-medium text-gray-700 hover:text-[rgba(213,106,54,1)]"
          to={"/product"}
        >
          SẢN PHẨM
        </NavLink>
        <NavLink
          className="text-sm font-medium text-gray-700 hover:text-[rgba(213,106,54,1)]"
          to={"/import-policy"}
        >
          CHÍNH SÁCH NHẬP HÀNG
        </NavLink>
        <NavLink
          className="text-sm font-medium text-gray-700 hover:text-[rgba(213,106,54,1)]"
          to={"/delivery"}
        >
          GIAO HÀNG
        </NavLink>
      </div>
    </>
  );
};

export default Navbar;
