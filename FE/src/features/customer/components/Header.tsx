// src/components/layout/user/header/Header.tsx (or relevant path)

import React from "react";
import Navbar from "./Navbar"; // Assuming Navbar is in the same directory
import { NavLink } from "react-router-dom";
import { clearAuthCredentials } from "@/utils/authUtil"; // Adjust path if needed
import { FaShoppingCart } from "react-icons/fa";
import { FaHistory } from "react-icons/fa"; // History icon
import { cn } from "@/lib/utils"; // Import cn if needed for additional classes

const Header: React.FC = () => {
  const handleLogout = () => {
    clearAuthCredentials();
    // Optionally redirect here if needed, though NavLink already does
    // window.location.href = '/login';
  };

  return (
    // Main header container: flex row, space between items, center vertically, padding
    <div
      className={cn(
        "w-full bg-gradient-to-r from-ch-red-50 to-ch-blue-50 dark:bg-ch-gray-900 shadow-md px-4 sm:px-6 lg:px-8 py-3", // Add background, shadow, padding
        "flex justify-between items-center" // Core flex layout
      )}
    >
      {/* Left Side: Logo */}
      {/* Wrap logo in a Link to homepage if desired */}
      <NavLink to="/" aria-label="Homepage">
        <img
          className="h-10 sm:h-12 lg:h-14 w-auto"
          src="/logo.png"
          alt="Logo" // Ensure alt text is descriptive
        />
        {/* Adjusted height, added alt text, ensure logo path is correct from public folder */}
      </NavLink>

      {/* Icons and Logout */}
      <div className="flex items-center space-x-4">
        <NavLink
          to="/cart"
          className="text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue-light transition-colors duration-200"
          aria-label="Shopping Cart"
        >
          <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        </NavLink>
        <NavLink
          to="/invoice"
          className="text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue-light transition-colors duration-200"
          aria-label="Order History"
        >
          <FaHistory className="w-5 h-5 sm:w-6 sm:h-6" />
        </NavLink>
        <NavLink
          to="/login"
          className="text-sm font-medium text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue-light transition-colors duration-200"
          onClick={handleLogout}
        >
          Logout
        </NavLink>
      </div>
    </div>
  );
};

export default Header;
