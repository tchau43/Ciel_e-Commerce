import { clearAuthCredentials } from "@/utils/authUtil";
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const isLAuth = localStorage.getItem("access_token") !== null;
  const handleLogout = () => {
    clearAuthCredentials();
  };

  useEffect(() => {}, [localStorage]);

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100">
      {/* Logo (5px wide, aligned left) */}
      <NavLink to="/home" className="bg-amber-500 p-1 w-5 h-5"></NavLink>

      {/* Navigation links (Home, Login, Register, aligned right) */}
      <div className="flex items-center">
        <NavLink
          to="/home"
          className="mx-2 hover:underline hover:text-blue-500"
        >
          Home
        </NavLink>

        {!isLAuth ? (
          <>
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
          </>
        ) : (
          <>
            <NavLink
              to="/"
              className="mx-2 hover:underline hover:text-blue-500"
              onClick={handleLogout}
            >
              Logout
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;
