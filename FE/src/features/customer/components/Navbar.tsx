// src/features/customer/layout/components/Navbar.tsx

import React from "react";
import { NavLink, Link } from "react-router-dom"; // Thêm Link
import { cn } from "@/lib/utils";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { Category } from "@/types/dataTypes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Skeleton } from "@/components/ui/skeleton";

const Navbar: React.FC = () => {
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery();
  const categories: Category[] | undefined = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data;

  const linkBaseClasses = "text-sm font-medium transition-colors duration-200";
  const linkHoverClasses = "hover:text-ch-red";
  const lightModeText = "text-gray-700 dark:text-gray-300";
  const activeClass = "!text-ch-red font-semibold";

  return (
    <nav
      className={cn(
        "w-full bg-white dark:bg-ch-gray-900 shadow-sm sticky top-0 z-40",
        "border-b border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="h-12 space-x-4 md:space-x-6">
            <NavigationMenuItem>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    linkBaseClasses,
                    lightModeText,
                    linkHoverClasses,
                    isActive ? activeClass : ""
                  )
                }
              >
                TRANG CHỦ
              </NavLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger
                // Không cần className phức tạp ở đây nữa vì Link bên trong sẽ xử lý style chữ
                // Trigger chỉ cần style cơ bản để nhận hover
                className={cn(
                  navigationMenuTriggerStyle(),
                  lightModeText,
                  "relative"
                )} // Thêm relative nếu cần cho active state indicator sau này
              >
                {/* Bọc nội dung chữ bằng Link */}
                <Link
                  to="/product" // Link đến trang sản phẩm chung khi click
                  className={cn(
                    linkBaseClasses,
                    linkHoverClasses
                    // Không cần activeClass ở đây vì NavLink bên ngoài (cho mục khác) xử lý active
                  )}
                  // Ngăn không cho sự kiện click của Link lan tỏa lên Trigger (tránh hành vi không mong muốn)
                  onClick={(e) => e.stopPropagation()}
                >
                  SẢN PHẨM
                </Link>
                {/* Icon mũi tên vẫn nằm trong Trigger */}
                {/* Icon đã có sẵn trong NavigationMenuTrigger của Shadcn rồi, không cần thêm */}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {isLoadingCategories ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <ListItem
                        key={category._id}
                        title={category.name}
                        // Giữ nguyên link đến trang lọc sản phẩm theo category
                        to={`/product?category=${category._id}`}
                      >
                        {category.description}
                      </ListItem>
                    ))
                  ) : (
                    <li className="col-span-full text-center text-sm text-gray-500 p-4">
                      Không có danh mục nào.
                    </li>
                  )}
                  {!isLoadingCategories && (
                    <li className="md:col-span-2 mt-2">
                      <ListItem
                        title="Xem tất cả sản phẩm"
                        to="/product"
                        className="font-semibold text-ch-blue hover:bg-accent/80"
                      >
                        Duyệt qua bộ sưu tập đầy đủ của chúng tôi.
                      </ListItem>
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    linkBaseClasses,
                    lightModeText,
                    linkHoverClasses,
                    isActive ? activeClass : ""
                  )
                }
              >
                GIỎ HÀNG
              </NavLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavLink
                to="/invoice"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    linkBaseClasses,
                    lightModeText,
                    linkHoverClasses,
                    isActive ? activeClass : ""
                  )
                }
              >
                LỊCH SỬ MUA HÀNG
              </NavLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavLink
                to="/faq"
                className={({ isActive }) =>
                  cn(
                    navigationMenuTriggerStyle(),
                    linkBaseClasses,
                    lightModeText,
                    linkHoverClasses,
                    isActive ? activeClass : ""
                  )
                }
              >
                FAQ
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<typeof NavLink>,
  React.ComponentPropsWithoutRef<typeof NavLink> & { title: string }
>(({ className, title, children, to, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <NavLink
          ref={ref}
          to={to}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {typeof children !== "function" && children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </NavLink>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
