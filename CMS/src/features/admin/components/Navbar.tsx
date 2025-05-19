import { clearAuthCredentials } from "@/utils/authUtil";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const handleLogout = () => {
    clearAuthCredentials();
  };

  useEffect(() => {}, [localStorage]);
  return (
    <div className="flex ">
      <NavLink to="/users" className="mx-2 hover:underline hover:text-blue-500">
        Users Management
      </NavLink>
      <NavLink
        to="/products"
        className="mx-2 hover:underline hover:text-blue-500"
      >
        Products Management
      </NavLink>
      <NavLink
        to="/login"
        className="mx-2 hover:underline hover:text-blue-500"
        onClick={handleLogout}
      >
        Logout
      </NavLink>
    </div>
  );
};

export default Navbar;
