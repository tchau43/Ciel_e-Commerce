import { clearAuthCredentials } from "@/utils/authUtil";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import CLogo from "./CLogo";

const Header: React.FC = () => {
  const isLAuth = localStorage.getItem("access_token") !== null;
  const [isScrolled, setIsScrolled] = useState(false);
  const handleLogout = () => {
    clearAuthCredentials();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    hover: {
      scale: 1.1,
      textShadow: "0 0 8px rgb(59, 130, 246)",
      transition: { type: "spring", stiffness: 300 },
    },
  };

  const logoVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: { type: "spring", stiffness: 200 },
    },
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="w-10 h-10 relative overflow-hidden rounded-full"
          >
            <NavLink to="/landing" className="block w-full h-full">
              <CLogo />
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </NavLink>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <motion.div
              variants={navLinkVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <NavLink
                to="/landing"
                className={({ isActive }) =>
                  `text-lg font-medium transition-all duration-300 ${
                    isScrolled
                      ? "text-gray-800 dark:text-gray-100"
                      : "text-gray-900"
                  } ${isActive ? "text-blue-600" : ""}`
                }
              >
                Trang chủ
              </NavLink>
            </motion.div>

            <motion.div
              variants={navLinkVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              {!isLAuth ? (
                <NavLink
                  to="/auth"
                  className="relative inline-flex items-center px-6 py-2 overflow-hidden font-medium transition-all bg-blue-600 rounded-lg hover:bg-blue-700 group"
                >
                  <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                  <span className="relative text-white">
                    Đăng nhập / Đăng ký
                  </span>
                </NavLink>
              ) : (
                <NavLink
                  to="/landing"
                  onClick={handleLogout}
                  className="relative inline-flex items-center px-6 py-2 overflow-hidden font-medium transition-all bg-red-600 rounded-lg hover:bg-red-700 group"
                >
                  <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                  <span className="relative text-white">Đăng xuất</span>
                </NavLink>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
