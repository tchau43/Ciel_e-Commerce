import React from "react";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-100">
      {/* Logo (5px wide, aligned left) */}
      <NavLink to="/landing" className="bg-amber-500 p-1 w-5 h-5"></NavLink>

      {/* Navigation links (Home, Login, Register, aligned right) */}
      <div className="flex items-center">
        <NavLink
          to="/landing"
          className="mx-2 hover:underline hover:text-blue-500"
        >
          Home
        </NavLink>
        <NavLink
          to="/login"
          className="mx-2 hover:underline hover:text-blue-500"
        >
          Login
        </NavLink>
        <NavLink
          to="/register"
          className="mx-2 hover:underline hover:text-blue-500"
        >
          Register
        </NavLink>
      </div>
    </div>
  );
};

export default Header;
