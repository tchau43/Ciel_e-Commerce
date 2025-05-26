// src/components/shared/ProductCard.tsx
import { IoCartOutline } from "react-icons/io5"; // Or your preferred cart icon
import React, { useState, useRef, MouseEvent } from "react";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardBorder, // Import the border wrapper
} from "@/components/ui/card";
// import { ProductData } from "@/types/dataTypes"; // <-- Change this
import { Product } from "@/types/dataTypes"; // <-- Use the correct type 'Product'
import { cn } from "@/lib/utils"; //

// --- Helper: Price Formatting (Updated for VND) ---
const formatPrice = (price: number) => {
  // return new Intl.NumberFormat("en-US", { // <-- Old version
  //   style: "currency",
  //   currency: "USD", // Adjust currency as needed
  // }).format(price);
  return new Intl.NumberFormat("vi-VN", {
    // <-- Use Vietnamese locale
    style: "currency",
    currency: "VND", // <-- Use VND currency
  }).format(price);
};

// --- Helper: Format Purchase Quantity ---
const formatPurchaseQuantity = (quantity: number) => {
  if (quantity >= 1000000) {
    return `${(quantity / 1000000).toFixed(1)}M`;
  } else if (quantity >= 1000) {
    return `${(quantity / 1000).toFixed(1)}K`;
  }
  return quantity.toString();
};

// --- Helper: Placeholder Icons (Keep as is) ---
const StarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={cn("w-3 h-3 sm:w-4 sm:h-4", className)}
  >
    <path
      fillRule="evenodd"
      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
      clipRule="evenodd"
    />
  </svg>
);

const BagIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-3 h-3 sm:w-4 sm:h-4", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
    />
  </svg>
);

// --- Product Card Component ---
interface ProductCardProps {
  // product: ProductData; // <-- Change this
  product: Product; // <-- Use the correct type 'Product'
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const navigate = useNavigate(); // <-- Initialize useNavigate

  // --- Click Handler for Navigation ---
  const handleCardClick = () => {
    navigate(`/product/${product._id}`); // Navigate to product detail page
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const { width, height, left, top } = rect;
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    const rotateY = (mouseX / width - 0.5) * 15; // Reduced sensitivity slightly
    const rotateX = -(mouseY / height - 0.5) * 15; // Reduced sensitivity slightly
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const imageUrl = product.images?.[0] || "/placeholder-image.png";

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation when clicking button
    e.preventDefault();
    console.log(`Add ${product.name} (ID: ${product._id}) to cart`);
    // Add actual add to cart logic here
  };

  return (
    <CardBorder
      className={cn("h-full group/card", className)}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x / 4}deg) rotateY(${
          rotate.y / 4
        }deg) scale3d(1, 1, 1)`,
        transformStyle: "preserve-3d",
        transition: "all 0.3s ease-out",
      }}
      onClick={handleCardClick}
    >
      <Card
        ref={cardRef}
        className={cn(
          "group relative overflow-hidden hover:cursor-pointer border-0",
          "h-full bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50",
          "hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500",
          "dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section */}
        <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full transition-all duration-700 ease-in-out group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.png";
            }}
          />
          {/* Tag with shimmer effect */}
          {product.tags?.[0] && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full z-10 shadow-lg shadow-red-500/20 animate-shimmer">
              {product.tags[0]}
            </span>
          )}
          {/* Enhanced Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          {/* Cart Button with enhanced animation */}
          <button
            onClick={handleAddToCartClick}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "absolute bottom-4 right-4 z-20",
              "p-2 sm:p-3 rounded-full shadow-lg",
              "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
              "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0",
              "transition-all duration-500 ease-out",
              "hover:from-blue-600 hover:to-indigo-600 hover:scale-110 hover:rotate-3",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <IoCartOutline className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content Section with enhanced spacing and animations */}
        <div className="flex flex-col flex-grow p-4 sm:p-5">
          {/* Header */}
          <CardHeader className="p-0 space-y-2">
            <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </CardTitle>
            {product.category?.name && (
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {product.category.name}
              </CardDescription>
            )}
          </CardHeader>

          {/* Content with enhanced price display */}
          <CardContent className="p-0 mt-3 sm:mt-4 flex-grow">
            <div className="flex items-end gap-2 mb-3">
              <p className="font-bold text-lg sm:text-xl bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                {formatPrice(product.base_price)}
              </p>
              {product.base_price &&
                product.base_price > product.base_price && (
                  <p className="text-sm text-slate-400 line-through">
                    {formatPrice(product.base_price)}
                  </p>
                )}
            </div>

            {/* Stats with enhanced design */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded-full px-2 py-1 text-xs">
                <StarIcon className="w-3.5 h-3.5 mr-1 text-yellow-400" />
                <span>{product.averageRating?.toFixed(1) || "N/A"}</span>
                <span className="text-slate-400 dark:text-slate-500 ml-1">
                  ({product.numberOfReviews || 0})
                </span>
              </span>
              <span className="flex items-center bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-500 rounded-full px-2 py-1 text-xs">
                <BagIcon className="w-3.5 h-3.5 mr-1" />
                <span>
                  {formatPurchaseQuantity(product.purchasedQuantity || 0)} đã
                  bán
                </span>
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </CardBorder>
  );
};

export default ProductCard;
