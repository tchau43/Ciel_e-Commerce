import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react"; // Icons remain the same
import { clearAuthCredentials, getAuthCredentials } from "@/utils/authUtil";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme"; // Assuming path is correct

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userInfo } = getAuthCredentials();
  const [theme, toggleTheme] = useTheme();

  const handleLogout = () => {
    clearAuthCredentials();
    // Optional: window.location.href = '/login';
  };

  // Navigation items with Vietnamese labels
  const navItems = [
    { to: "/users", label: "Người dùng" }, // Translated
    { to: "/products", label: "Sản phẩm" }, // Translated
    { to: "/invoices", label: "Đơn hàng" }, // Translated
    { to: "/coupons", label: "Mã giảm giá" }, // Added Coupon Management
    // Add more admin links here if needed
  ];

  // Class names remain the same
  const baseLinkClass =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  const inactiveLinkClass =
    "text-foreground/70 hover:text-foreground hover:bg-accent dark:text-foreground/70 dark:hover:text-foreground dark:hover:bg-accent";
  const activeLinkClass =
    "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border/40 dark:bg-card/95 dark:supports-[backdrop-filter]:bg-card/60">
      {/* Changed max-w-7xl to max-w-screen for potentially wider header based on user code */}
      <div className="container flex h-16 max-w-screen items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Logo/Brand */}
        <div className="flex items-center">
          <NavLink to="/" className="flex items-center space-x-2">
            {/* Logo SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary dark:text-primary-foreground"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            {/* Brand Name - kept "Admin" */}
            <span className="font-bold text-lg text-foreground dark:text-foreground">
              Admin
            </span>
          </NavLink>
        </div>

        {/* Center Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  baseLinkClass,
                  isActive ? activeLinkClass : inactiveLinkClass
                )
              }
            >
              {item.label} {/* Uses translated label */}
            </NavLink>
          ))}
        </nav>

        {/* Right Side: Actions & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            // Translated aria-label, dynamically changes
            aria-label={`Chuyển sang chế độ ${
              theme === "light" ? "tối" : "sáng"
            }`}
            className="p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-accent dark:text-foreground/70 dark:hover:text-foreground dark:hover:bg-accent transition-colors"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>

          {/* User Info / Logout (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {userInfo && (
              // Translated greeting
              <span className="text-sm text-muted-foreground hidden lg:inline">
                Chào, {userInfo.name}!
              </span>
            )}
            <NavLink
              to="/login"
              className={cn(
                baseLinkClass,
                inactiveLinkClass,
                "bg-destructive/10 hover:bg-destructive/20 text-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:text-red-400"
              )}
              onClick={handleLogout}
            >
              Đăng xuất {/* Translated */}
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground/70 hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:text-foreground/70 dark:hover:text-foreground dark:hover:bg-accent dark:focus:ring-primary-foreground"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {/* Translated screen reader text */}
              <span className="sr-only">Mở menu chính</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t border-border dark:border-border/40"
          id="mobile-menu"
        >
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    baseLinkClass,
                    "block text-base",
                    isActive ? activeLinkClass : inactiveLinkClass
                  )
                }
              >
                {item.label} {/* Uses translated label */}
              </NavLink>
            ))}
            {/* Logout Button in Mobile Menu */}
            <NavLink
              to="/login"
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                baseLinkClass,
                inactiveLinkClass,
                "block text-base w-full text-left bg-destructive/10 hover:bg-destructive/20 text-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:text-red-400"
              )}
            >
              Đăng xuất {/* Translated */}
            </NavLink>
            {userInfo && (
              // Translated logged in message
              <div className="px-3 pt-2 text-sm text-muted-foreground">
                Đăng nhập với tên: {userInfo.name}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
