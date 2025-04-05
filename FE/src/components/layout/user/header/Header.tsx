import React from "react";
import Navbar from "./Navbar";
import { NavLink } from "react-router-dom";
import { clearAuthCredentials } from "@/utils/authUtil";
import { FaShoppingCart } from "react-icons/fa";
import { FaHistory } from "react-icons/fa"; // History icon

const Header: React.FC = () => {
  const handleLogout = () => {
    clearAuthCredentials();
  };
  return (
    <div className="h-max w-screen m-0 relative">
      <div className="right-4 top-1 w-fit absolute flex  items-center gap-x-4">
        <NavLink to="/cart">
          <FaShoppingCart />
        </NavLink>
        <NavLink to="/invoice">
          <FaHistory />
        </NavLink>
        <NavLink
          to="/login"
          className="hover:underline hover:text-blue-500 "
          onClick={handleLogout}
        >
          Logout
        </NavLink>
      </div>
      <div className="h-full flex flex-col items-center my-8 gap-4">
        <img className="h-16" src="../public/logo.png"></img>
        <Navbar />
      </div>
    </div>
  );
};

export default Header;
