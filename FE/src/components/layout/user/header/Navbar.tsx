// src/components/layout/user/header/Navbar.tsx (adjust path if needed)
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils"; // Adjust path if needed

const Navbar: React.FC = () => {
  const linkBaseClasses = "text-sm font-medium transition-colors duration-200";
  const linkHoverClasses = "hover:text-[rgba(213,106,54,1)]"; // Your specific hover color
  const lightModeText = "text-gray-700 dark:text-gray-300"; // Adjusted dark text
  const activeClass = "text-[rgba(213,106,54,1)]"; // Your specific active color

  return (
    // Wrapper for the Navbar bar
    <nav // Use nav semantic tag
      className={cn(
        "w-full bg-ch-gray-100 dark:bg-ch-gray-900 shadow-sm", // Light gray background, same dark bg, subtle shadow
        "border-t border-b border-gray-200 dark:border-gray-700" // Optional subtle borders
      )}
    >
      {/* Inner container to control width and padding */}
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-12 space-x-6 md:space-x-8">
          {" "}
          {/* Center links, set height, control spacing */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                linkBaseClasses,
                lightModeText,
                linkHoverClasses,
                isActive ? activeClass : ""
              )
            }
          >
            TRANG CHỦ
          </NavLink>
          <NavLink
            to="/company"
            className={({ isActive }) =>
              cn(
                linkBaseClasses,
                lightModeText,
                linkHoverClasses,
                isActive ? activeClass : ""
              )
            }
          >
            GIỚI THIỆU CÔNG TY
          </NavLink>
          <NavLink
            to="/product"
            className={({ isActive }) =>
              cn(
                linkBaseClasses,
                lightModeText,
                linkHoverClasses,
                isActive ? activeClass : ""
              )
            }
          >
            SẢN PHẨM
          </NavLink>
          <NavLink
            to="/import-policy"
            className={({ isActive }) =>
              cn(
                linkBaseClasses,
                lightModeText,
                linkHoverClasses,
                isActive ? activeClass : ""
              )
            }
          >
            CHÍNH SÁCH NHẬP HÀNG
          </NavLink>
          <NavLink
            to="/delivery"
            className={({ isActive }) =>
              cn(
                linkBaseClasses,
                lightModeText,
                linkHoverClasses,
                isActive ? activeClass : ""
              )
            }
          >
            GIAO HÀNG
          </NavLink>
          {/* Add more NavLink items here if needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
