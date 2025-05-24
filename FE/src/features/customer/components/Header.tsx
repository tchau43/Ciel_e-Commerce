// src/features/customer/layout/components/Header.tsx

import React, { useState, useEffect, ChangeEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { clearAuthCredentials, getAuthCredentials } from "@/utils/authUtil"; // Thêm getAuthCredentials
// import { FaShoppingCart, FaHistory } from "react-icons/fa"; // BỎ IMPORT ICON
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react"; // Ví dụ icon thay thế logout

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
  const { token, userInfo } = getAuthCredentials(); // Lấy token và userInfo

  const handleLogout = () => {
    clearAuthCredentials();
    navigate("/landing"); // Điều hướng về login sau khi logout
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    const searchText = searchInput.trim();
    // Giữ lại các query params khác nếu có, chỉ cập nhật searchText
    const currentParams = new URLSearchParams(location.search);
    if (searchText) {
      currentParams.set("searchText", searchText);
    } else {
      currentParams.delete("searchText");
    }
    // Điều hướng đến trang /products thay vì /product nếu trang sản phẩm là /products
    navigate(`/products?${currentParams.toString()}`);
  };

  useEffect(() => {
    // Chỉ cập nhật ô search nếu đang ở trang sản phẩm
    if (location.pathname.startsWith("/products")) {
      const params = new URLSearchParams(location.search);
      setSearchInput(params.get("searchText") || "");
    } else {
      setSearchInput(""); // Xóa ô search khi chuyển sang trang khác
    }
  }, [location.pathname, location.search]);

  return (
    <div
      className={cn(
        "w-full bg-gradient-to-r from-ch-red-50 to-ch-blue-50 dark:bg-ch-gray-900 shadow-md px-4 sm:px-6 lg:px-8 py-3",
        "flex justify-between items-center"
      )}
    >
      {/* Logo */}
      <NavLink to="/" aria-label="Homepage">
        <img
          className="h-10 sm:h-12 lg:h-14 w-auto"
          src="/CielLogo.png"
          alt="CielLogo"
        />
      </NavLink>
      <div></div>

      {/* Search Bar */}
      <div className="flex-1 mx-4 sm:mx-8 max-w-lg">
        {" "}
        {/* Tăng max-w */}
        <div className="flex rounded shadow-md border border-gray-300 dark:border-gray-600">
          {" "}
          {/* Thêm border */}
          <label htmlFor="header-search-input" className="sr-only">
            Tìm kiếm sản phẩm
          </label>
          <input
            id="header-search-input"
            type="search"
            className="w-full px-4 py-2 border-none rounded-l-md focus:outline-none focus:ring-2 focus:ring-ch-blue focus:border-transparent dark:bg-gray-800 dark:text-white" // Bỏ border, thêm dark mode bg
            placeholder="Tìm kiếm sản phẩm..."
            value={searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          />
          <button
            onClick={handleSearchSubmit}
            className="bg-ch-blue hover:bg-ch-blue-dark text-white rounded-r-md px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ch-blue focus:ring-offset-1 transition-colors" // Giảm padding x một chút
            aria-label="Submit search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* BỎ CÁC NAVLINK CHO /cart và /invoice */}
        {/* <NavLink to="/cart" ... > <FaShoppingCart /> </NavLink> */}
        {/* <NavLink to="/invoice" ... > <FaHistory /> </NavLink> */}

        {token ? (
          // Nếu đã đăng nhập: Hiển thị tên user và nút logout
          <>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
              Chào, {userInfo?.name || "bạn"}! {/* Hiển thị tên user nếu có */}
            </span>
            {/* Có thể thay span trên bằng một Dropdown Menu cho tài khoản */}
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-ch-red dark:text-gray-300 dark:hover:text-ch-red transition-colors duration-200 p-1"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" /> {/* Icon Logout */}
              <span className="ml-1 hidden md:inline">Đăng xuất</span>
            </button>
          </>
        ) : (
          // Nếu chưa đăng nhập: Hiển thị nút Login/Register
          <NavLink
            to="/login"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-ch-blue dark:text-gray-300 dark:hover:text-ch-blue transition-colors duration-200 p-1"
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" /> {/* Icon User */}
            <span className="ml-1 hidden md:inline">Đăng nhập</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Header;
