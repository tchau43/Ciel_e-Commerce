// src/features/customer/layout/components/Navbar.tsx

import React, { useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { Category } from "@/types/dataTypes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  Laptop,
  Clock,
  Tablet,
  Headphones,
  Package,
  Home,
  ShoppingCart,
  FileText,
  Star,
  HelpCircle,
  Phone,
  Watch as WatchIcon,
  Keyboard,
  Mouse,
  Speaker,
  Cable,
  Gamepad,
} from "lucide-react";

const categoryIcons: { [key: string]: React.ReactNode } = {
  "ĐIỆN THOẠI DI ĐỘNG": <Phone className="w-5 h-5" />,
  "ĐIỆN THOẠI": <Phone className="w-5 h-5" />,
  MOBILE: <Phone className="w-5 h-5" />,
  SMARTPHONE: <Smartphone className="w-5 h-5" />,
  LAPTOP: <Laptop className="w-5 h-5" />,
  "ĐỒNG HỒ": <Clock className="w-5 h-5" />,
  "ĐỒNG HỒ THÔNG MINH": <WatchIcon className="w-5 h-5" />,
  SMARTWATCH: <WatchIcon className="w-5 h-5" />,
  WATCH: <WatchIcon className="w-5 h-5" />,
  "MÁY TÍNH BẢNG": <Tablet className="w-5 h-5" />,
  TABLET: <Tablet className="w-5 h-5" />,
  "BÀN PHÍM": <Keyboard className="w-5 h-5" />,
  CHUỘT: <Mouse className="w-5 h-5" />,
  LOA: <Speaker className="w-5 h-5" />,
  "TAI NGHE": <Headphones className="w-5 h-5" />,
  "CÁP SẠC": <Cable className="w-5 h-5" />,
  "PHỤ KIỆN GAMING": <Gamepad className="w-5 h-5" />,
  "PHỤ KIỆN": <Headphones className="w-5 h-5" />,
  KHÁC: <Package className="w-5 h-5" />,
};

const menuIcons = {
  home: <Home className="w-5 h-5" />,
  products: <Smartphone className="w-5 h-5" />,
  cart: <ShoppingCart className="w-5 h-5" />,
  invoice: <FileText className="w-5 h-5" />,
  reviews: <Star className="w-5 h-5" />,
  faq: <HelpCircle className="w-5 h-5" />,
};

interface NavbarWrapperProps {
  children: React.ReactNode;
}

const NavbarWrapper: React.FC<NavbarWrapperProps> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProductHovered, setIsProductHovered] = useState(false);

  return (
    <div className="relative">
      <Navbar
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isProductHovered={isProductHovered}
        setIsProductHovered={setIsProductHovered}
      />
      <main className="pl-16">{children}</main>
    </div>
  );
};

interface NavbarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  isProductHovered: boolean;
  setIsProductHovered: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isExpanded,
  setIsExpanded,
  isProductHovered,
  setIsProductHovered,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery();
  const categories: Category[] | undefined = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data;

  const linkBaseClasses = "text-sm font-medium transition-colors duration-200";
  const linkHoverClasses = "hover:text-ch-red";
  const lightModeText = "text-gray-700 dark:text-gray-300";
  const activeClass = "!text-ch-red font-semibold";

  const isProductsActive = location.pathname.startsWith("/product");

  const menuItems = [
    { path: "/", label: "TRANG CHỦ", icon: menuIcons.home },
    {
      path: "/products",
      label: "SẢN PHẨM",
      icon: menuIcons.products,
      hasSubmenu: true,
    },
    { path: "/cart", label: "GIỎ HÀNG", icon: menuIcons.cart },
    { path: "/invoice", label: "LỊCH SỬ MUA HÀNG", icon: menuIcons.invoice },
    { path: "/reviews", label: "ĐÁNH GIÁ SẢN PHẨM", icon: menuIcons.reviews },
    { path: "/faq", label: "FAQ", icon: menuIcons.faq },
  ];

  const getCategoryIcon = (categoryName: string) => {
    // Thử tìm icon chính xác theo tên
    const exactMatch = categoryIcons[categoryName.toUpperCase()];
    if (exactMatch) return exactMatch;

    // Nếu không tìm thấy, tìm icon theo từ khóa trong tên
    const normalizedName = categoryName.toUpperCase();
    if (
      normalizedName.includes("ĐIỆN THOẠI") ||
      normalizedName.includes("MOBILE") ||
      normalizedName.includes("PHONE")
    ) {
      return categoryIcons["ĐIỆN THOẠI"];
    }
    if (
      normalizedName.includes("ĐỒNG HỒ") ||
      normalizedName.includes("WATCH")
    ) {
      return categoryIcons["ĐỒNG HỒ"];
    }
    if (
      normalizedName.includes("TABLET") ||
      normalizedName.includes("MÁY TÍNH BẢNG")
    ) {
      return categoryIcons["TABLET"];
    }
    if (normalizedName.includes("GAMING")) {
      return categoryIcons["PHỤ KIỆN GAMING"];
    }
    if (
      normalizedName.includes("PHỤ KIỆN") ||
      normalizedName.includes("ACCESSORY")
    ) {
      return categoryIcons["PHỤ KIỆN"];
    }

    // Nếu không tìm thấy, trả về icon mặc định
    return categoryIcons["KHÁC"];
  };

  const handleProductClick = () => {
    navigate("/products");
    setIsExpanded(false);
    setIsProductHovered(false);
  };

  return (
    <>
      {/* Dark Overlay */}
      <AnimatePresence>
        {(isExpanded || isProductHovered) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[998]"
            onClick={() => {
              setIsExpanded(false);
              setIsProductHovered(false);
            }}
          />
        )}
      </AnimatePresence>

      <motion.nav
        className={cn(
          "fixed left-0 top-0 h-screen z-[999]",
          "bg-white dark:bg-ch-gray-900 shadow-lg overflow-hidden"
        )}
        initial={false}
        animate={{ width: isExpanded ? "18rem" : "4rem" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setIsProductHovered(false);
        }}
      >
        <div className="h-full py-4 w-72">
          {/* Logo Section */}
          <div className="px-4 mb-8">
            <div className="flex items-center gap-3">
              <img
                src="/CLogo.png"
                alt="Ciel Logo"
                className="w-8 h-8 object-contain flex-shrink-0"
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg text-gray-800 dark:text-white whitespace-nowrap"
              >
                Ciel Store
              </motion.span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2 px-2">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.hasSubmenu ? (
                  <div
                    className="relative"
                    onMouseEnter={() => isExpanded && setIsProductHovered(true)}
                    onMouseLeave={() => setIsProductHovered(false)}
                  >
                    <button
                      onClick={handleProductClick}
                      className={cn(
                        "w-full h-10 px-3 flex items-center gap-3",
                        linkBaseClasses,
                        lightModeText,
                        linkHoverClasses,
                        isProductsActive ? activeClass : "",
                        "hover:bg-gray-100 dark:hover:bg-ch-gray-800 rounded-md",
                        isProductHovered && "bg-gray-100 dark:bg-ch-gray-800"
                      )}
                    >
                      <span className="flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {isExpanded && isProductHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="absolute left-full top-0 ml-2 z-[60] w-[280px] p-4 bg-white dark:bg-ch-gray-800 rounded-lg shadow-lg"
                        >
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              Danh mục sản phẩm
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Chọn danh mục bạn quan tâm
                            </p>
                          </div>
                          <div className="space-y-1">
                            {isLoadingCategories ? (
                              <div className="space-y-2">
                                <div className="h-12 bg-gray-200 dark:bg-ch-gray-700 rounded-md animate-pulse" />
                                <div className="h-12 bg-gray-200 dark:bg-ch-gray-700 rounded-md animate-pulse" />
                                <div className="h-12 bg-gray-200 dark:bg-ch-gray-700 rounded-md animate-pulse" />
                              </div>
                            ) : categories && categories.length > 0 ? (
                              categories.map((category) => (
                                <Link
                                  key={category._id}
                                  to={`/product?category=${category._id}`}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md w-full",
                                    "transition-all duration-200",
                                    "hover:bg-gray-50 dark:hover:bg-ch-gray-700",
                                    "group"
                                  )}
                                  onClick={() => {
                                    setIsExpanded(false);
                                    setIsProductHovered(false);
                                  }}
                                >
                                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-ch-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-ch-gray-600 transition-colors">
                                    {getCategoryIcon(category.name)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {category.name}
                                    </h4>
                                    {category.description && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {category.description}
                                      </p>
                                    )}
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Không có danh mục nào.
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "w-full h-10 px-3 flex items-center gap-3",
                        linkBaseClasses,
                        lightModeText,
                        linkHoverClasses,
                        isActive ? activeClass : "",
                        "hover:bg-gray-100 dark:hover:bg-ch-gray-800 rounded-md"
                      )
                    }
                    onClick={() => setIsExpanded(false)}
                  >
                    <span className="flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isExpanded ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export { NavbarWrapper as default, Navbar };
