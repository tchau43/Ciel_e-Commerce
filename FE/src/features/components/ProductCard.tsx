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
    const rotateY = (mouseX / width - 0.5) * 10;
    const rotateX = -(mouseY / height - 0.5) * 10;
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
      className={cn(
        "h-full w-full group/card transition-transform duration-300 hover:scale-[1.02]",
        "min-w-[140px] w-[180px] sm:w-[200px] lg:w-[220px]",
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transformStyle: "preserve-3d",
        transition: "all 0.3s ease-out",
      }}
      onClick={handleCardClick}
    >
      <Card
        ref={cardRef}
        className={cn(
          "relative h-full overflow-hidden border-0 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50",
          "hover:cursor-pointer hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-500",
          "dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Container - Fixed aspect ratio */}
        <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-500 ease-in-out group-hover/card:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.png";
            }}
          />

          {/* Tag */}
          {product.tags?.[0] && (
            <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg shadow-red-500/20 animate-shimmer sm:px-2.5 sm:text-xs">
              {product.tags[0]}
            </span>
          )}

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

          {/* Cart Button */}
          <button
            onClick={handleAddToCartClick}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "absolute bottom-2 right-2 z-20",
              "rounded-full p-1.5 shadow-lg sm:p-2",
              "bg-gradient-to-r from-blue-500 to-indigo-500",
              "opacity-0 translate-y-4 group-hover/card:opacity-100 group-hover/card:translate-y-0",
              "transition-all duration-300 ease-out",
              "hover:from-blue-600 hover:to-indigo-600 hover:scale-110 hover:rotate-3",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <IoCartOutline className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Content Container - More compact */}
        <div className="flex flex-col p-2 sm:p-3">
          {/* Product Info */}
          <CardHeader className="space-y-1 p-0">
            <CardTitle className="line-clamp-2 min-h-[32px] text-xs font-semibold transition-colors duration-300 group-hover/card:text-blue-600 sm:min-h-[40px] sm:text-sm">
              {product.name}
            </CardTitle>
            {product.category?.name && (
              <CardDescription className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                {product.category.name}
              </CardDescription>
            )}
          </CardHeader>

          {/* Price and Stats */}
          <CardContent className="mt-1.5 space-y-2 p-0 sm:mt-2">
            {/* Price */}
            <div className="flex items-end gap-1.5">
              <p className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-sm font-bold text-transparent sm:text-base">
                {formatPrice(product.base_price)}
              </p>
              {product.base_price &&
                product.base_price > product.base_price && (
                  <p className="text-[10px] text-slate-400 line-through sm:text-xs">
                    {formatPrice(product.base_price)}
                  </p>
                )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center rounded-full bg-yellow-50 px-1.5 py-0.5 text-[9px] text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500 sm:text-[10px]">
                <StarIcon className="mr-0.5 text-yellow-400" />
                <span>{product.averageRating?.toFixed(1) || "N/A"}</span>
                <span className="ml-0.5 text-slate-400 dark:text-slate-500">
                  ({product.numberOfReviews || 0})
                </span>
              </span>
              <span className="flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-700 dark:bg-blue-500/10 dark:text-blue-500 sm:text-[10px]">
                <BagIcon className="mr-0.5" />
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
