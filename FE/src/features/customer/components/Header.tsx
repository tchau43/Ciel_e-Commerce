import React, { useState, useEffect, ChangeEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthCredentials } from "@/utils/authUtil";
import { FaShoppingCart, FaHistory } from "react-icons/fa";
import { cn } from "@/lib/utils";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-5 h-5", className)}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />{" "}
  </svg>
);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");

  const handleLogout = () => {
    clearAuthCredentials();
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    const searchText = searchInput.trim();
    const params = new URLSearchParams();

    if (searchText) {
      params.set("searchText", searchText);
    }
    navigate(`/product?${params.toString()}`);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/product")) {
      const params = new URLSearchParams(location.search);
      setSearchInput(params.get("searchText") || "");
    }
  }, [location.pathname, location.search]);

  return (
    <div
      className={cn(
        "w-full bg-gradient-to-r from-ch-red-50 to-ch-blue-50 dark:bg-ch-gray-900 shadow-md px-4 sm:px-6 lg:px-8 py-3",
        "flex justify-between items-center"
      )}
    >
      <NavLink to="/" aria-label="Homepage">
        <img
          className="h-10 sm:h-12 lg:h-14 w-auto"
          src="/logo.png"
          alt="Logo"
        />
      </NavLink>

      <div className="flex-1 mx-4 sm:mx-8 max-w-md">
        <div className="flex rounded shadow-md">
          <label htmlFor="header-search-input" className="sr-only">
            Search Products
          </label>
          <input
            id="header-search-input"
            type="search"
            className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-ch-blue focus:border-transparent"
            placeholder="Search products..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button
            onClick={handleSearchSubmit}
            className="bg-ch-blue hover:bg-ch-blue-100 text-white rounded-r-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ch-blue focus:ring-offset-1"
            aria-label="Submit search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <NavLink
          to="/cart"
          className="text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue-light transition-colors duration-200 p-1"
          aria-label="Shopping Cart"
        >
          <FaShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        </NavLink>
        <NavLink
          to="/invoice"
          className="text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue-light transition-colors duration-200 p-1"
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
