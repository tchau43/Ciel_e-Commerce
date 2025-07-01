import React, { useState, useEffect, ChangeEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthCredentials, getAuthCredentials } from "@/utils/authUtil";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-5 h-5", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const { token, userInfo } = getAuthCredentials();

  const handleLogout = () => {
    clearAuthCredentials();
    navigate("/landing");
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    const searchText = searchInput.trim();
    const currentParams = new URLSearchParams(location.search);

    if (searchText) {
      currentParams.set("searchText", searchText);
    } else {
      currentParams.delete("searchText");
    }

    navigate(`/products?${currentParams.toString()}`);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/products")) {
      const params = new URLSearchParams(location.search);
      setSearchInput(params.get("searchText") || "");
    } else {
      setSearchInput("");
    }
  }, [location.pathname, location.search]);

  return (
    <div
      className={cn(
        "w-auto bg-gradient-to-r from-ch-pink-50/80 to-ch-blue-50/80 dark:bg-ch-gray-900/80 ",
        "shadow-md px-4 sm:px-6 lg:px-8 py-3 backdrop-blur-md",
        "flex justify-between items-center",
        "fixed left-[4rem] top-0 right-0 z-50"
      )}
    >
      <NavLink to="/" aria-label="Homepage">
        <img
          className="h-10 sm:h-12 lg:h-14 w-auto"
          src="/CielLogo.png"
          alt="CielLogo"
        />
      </NavLink>
      <div></div>

      <div className="flex-1 mx-4 sm:mx-8 max-w-lg">
        <div className="flex rounded shadow-md border border-gray-300 dark:border-gray-600">
          <label htmlFor="header-search-input" className="sr-only">
            Tìm kiếm sản phẩm
          </label>
          <input
            id="header-search-input"
            type="search"
            className="w-full px-4 py-2 border-none rounded-l-md focus:outline-none focus:ring-2 focus:ring-ch-blue focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button
            onClick={handleSearchSubmit}
            className="bg-ch-blue hover:bg-ch-blue-dark text-white rounded-r-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ch-blue focus:ring-offset-1 transition-colors"
            aria-label="Submit search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {token ? (
          <>
            <NavLink
              to="/profile"
              className="text-sm font-medium text-gray-700 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue hidden sm:inline transition-colors duration-200"
            >
              Chào, {userInfo?.name || "bạn"}!
            </NavLink>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-ch-pink dark:text-gray-300 dark:hover:text-ch-pink transition-colors duration-200 p-1"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="ml-1 hidden md:inline">Đăng xuất</span>
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue transition-colors duration-200 p-1"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="ml-1 hidden md:inline">Đăng nhập</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Header;
