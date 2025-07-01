import React, { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { Category } from "@/types/dataTypes";
import {
  Smartphone,
  Laptop,
  Clock,
  Tablet,
  Headphones,
  Package,
  Watch as WatchIcon,
  Keyboard,
  Mouse,
  Speaker,
  Cable,
  Gamepad,
  Phone,
} from "lucide-react";

const categoryImages: { [key: string]: string } = {
  "ĐIỆN THOẠI DI ĐỘNG": "/Phone.jpg",
  "ĐIỆN THOẠI": "/Phone.jpg",
  MOBILE: "/Phone.jpg",
  SMARTPHONE: "/Phone.jpg",
  LAPTOP: "/Laptop.jpg",
  "ĐỒNG HỒ": "/Watch.png",
  "ĐỒNG HỒ THÔNG MINH": "/Watch.png",
  SMARTWATCH: "/Watch.png",
  WATCH: "/Watch.png",
};

const categoryIcons: { [key: string]: React.ReactNode } = {
  "ĐIỆN THOẠI DI ĐỘNG": <Phone className="w-6 h-6" />,
  "ĐIỆN THOẠI": <Phone className="w-6 h-6" />,
  MOBILE: <Phone className="w-6 h-6" />,
  SMARTPHONE: <Smartphone className="w-6 h-6" />,
  LAPTOP: <Laptop className="w-6 h-6" />,
  "ĐỒNG HỒ": <Clock className="w-6 h-6" />,
  "ĐỒNG HỒ THÔNG MINH": <WatchIcon className="w-6 h-6" />,
  SMARTWATCH: <WatchIcon className="w-6 h-6" />,
  WATCH: <WatchIcon className="w-6 h-6" />,
  "MÁY TÍNH BẢNG": <Tablet className="w-6 h-6" />,
  TABLET: <Tablet className="w-6 h-6" />,
  "BÀN PHÍM": <Keyboard className="w-6 h-6" />,
  CHUỘT: <Mouse className="w-6 h-6" />,
  LOA: <Speaker className="w-6 h-6" />,
  "TAI NGHE": <Headphones className="w-6 h-6" />,
  "CÁP SẠC": <Cable className="w-6 h-6" />,
  "PHỤ KIỆN GAMING": <Gamepad className="w-6 h-6" />,
  "PHỤ KIỆN": <Headphones className="w-6 h-6" />,
  KHÁC: <Package className="w-6 h-6" />,
};

interface CategoryShowcaseProps {
  categories: Category[];
  className?: string;
  onCategoryClick?: (category: Category) => void;
  categoryProductCounts?: { [key: string]: number };
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories,
  className,
  onCategoryClick,
  categoryProductCounts = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getCategoryImage = (categoryName: string) => {
    const exactMatch = categoryImages[categoryName.toUpperCase()];
    if (exactMatch) return exactMatch;

    const normalizedName = categoryName.toUpperCase();
    if (
      normalizedName.includes("ĐIỆN THOẠI") ||
      normalizedName.includes("MOBILE") ||
      normalizedName.includes("PHONE")
    ) {
      return categoryImages["ĐIỆN THOẠI"];
    }
    if (normalizedName.includes("LAPTOP")) {
      return categoryImages["LAPTOP"];
    }
    if (
      normalizedName.includes("ĐỒNG HỒ") ||
      normalizedName.includes("WATCH")
    ) {
      return categoryImages["ĐỒNG HỒ"];
    }
    return null;
  };

  const getCategoryIcon = (categoryName: string) => {
    const exactMatch = categoryIcons[categoryName.toUpperCase()];
    if (exactMatch) return exactMatch;

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

    return categoryIcons["KHÁC"];
  };

  useLayoutEffect(() => {
    if (!containerRef.current || categories.length === 0) return;

    const sectionItems = Array.from(
      containerRef.current.children
    ) as HTMLElement[];

    if (sectionItems.length === 0) return;

    const DURATION = 0.3;
    const EXPAND_FLEX_GROW = 2;
    const NORMAL_FLEX_GROW = 1;
    const SHRINK_FLEX_GROW = 0.5;

    sectionItems.forEach((item) => {
      const descriptionElement = item.querySelector(".category-description");
      const iconElement = item.querySelector(".category-icon");
      const countElement = item.querySelector(".category-count");
      if (descriptionElement) {
        gsap.set(descriptionElement, {
          opacity: 0,
          y: 20,
          display: "none",
        });
      }
      if (iconElement && countElement) {
        gsap.set([iconElement, countElement], {
          scale: 1,
        });
      }
      gsap.set(item, {
        flexGrow: NORMAL_FLEX_GROW,
        width: `${100 / sectionItems.length}%`,
      });

      item.addEventListener("mouseenter", () => {
        gsap.to(item, {
          flexGrow: EXPAND_FLEX_GROW,
          duration: DURATION,
          ease: "power2.inOut",
        });

        if (descriptionElement) {
          gsap.to(descriptionElement, {
            opacity: 1,
            y: 0,
            display: "block",
            duration: DURATION,
            ease: "power2.out",
          });
        }

        if (iconElement && countElement) {
          gsap.to([iconElement, countElement], {
            scale: 1.2,
            duration: DURATION,
            ease: "back.out",
          });
        }

        sectionItems.forEach((otherItem) => {
          if (otherItem !== item) {
            gsap.to(otherItem, {
              flexGrow: SHRINK_FLEX_GROW,
              duration: DURATION,
              ease: "power2.inOut",
            });
          }
        });
      });

      item.addEventListener("mouseleave", () => {
        gsap.to(item, {
          flexGrow: NORMAL_FLEX_GROW,
          duration: DURATION,
          ease: "power2.inOut",
        });

        if (descriptionElement) {
          gsap.to(descriptionElement, {
            opacity: 0,
            y: 20,
            display: "none",
            duration: DURATION,
            ease: "power2.in",
          });
        }

        if (iconElement && countElement) {
          gsap.to([iconElement, countElement], {
            scale: 1,
            duration: DURATION,
            ease: "back.out",
          });
        }

        sectionItems.forEach((otherItem) => {
          if (otherItem !== item) {
            gsap.to(otherItem, {
              flexGrow: NORMAL_FLEX_GROW,
              duration: DURATION,
              ease: "power2.inOut",
            });
          }
        });
      });
    });

    return () => {
      sectionItems.forEach((item) => {
        item.removeEventListener("mouseenter", () => {});
        item.removeEventListener("mouseleave", () => {});
      });
    };
  }, [categories]);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-row gap-4 md:gap-6 h-[200px] w-full", className)}
    >
      {categories.map((category) => {
        const backgroundImage = getCategoryImage(category.name);
        const productCount = categoryProductCounts[category._id] || 0;
        return (
          <div
            key={category._id}
            className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex-1 cursor-pointer shadow-lg hover:shadow-xl transition-shadow group"
            onClick={() => onCategoryClick?.(category)}
          >
            {backgroundImage ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-45"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  opacity: 0.35,
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 dark:from-primary/30 dark:to-primary/50" />
            )}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="category-icon mb-3 text-primary">
                {getCategoryIcon(category.name)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {category.name}
              </h3>
              {category.description && (
                <p className="category-description text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {category.description}
                </p>
              )}
              <div className="category-count text-sm font-medium text-primary/80 dark:text-primary/90 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                {productCount} sản phẩm
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
