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
    <CardBorder // Use the wrapper for the border and tilt effect
      className={cn("h-full", className)} // Ensure border wrapper takes full height
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x / 4}deg) rotateY(${
          rotate.y / 4
        }deg) scale3d(1, 1, 1)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
      }}
      onClick={handleCardClick} // <-- Add onClick handler to the outer border wrapper
    >
      <Card // The main card content, gets background/mouse events
        ref={cardRef} // Attach ref here for coordinate calculation
        className={cn(
          "group relative overflow-hidden hover:cursor-pointer", // group for hover effects
          "h-full" // Ensure inner card takes full height of border wrapper
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        // Remove onClick from here if CardBorder handles it
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          {/* Tag */}
          {product.tags?.[0] && (
            <span className="absolute top-2 left-2 bg-ch-red text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10 shadow-sm">
              {product.tags[0]} {/* Responsive text/padding */}
            </span>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Cart Icon - Slides from right */}
          <button
            onClick={handleAddToCartClick} // Ensure this stops propagation
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "absolute top-1/2 right-2 z-20 transform -translate-y-1/2",
              "p-1.5 sm:p-2 rounded-md shadow-md", // Responsive padding
              "bg-ch-blue text-white",
              "opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0",
              "transition-all duration-300 ease-in-out",
              "hover:bg-ch-blue-900 scale-100 hover:scale-110"
            )}
          >
            <IoCartOutline className="w-4 h-4 sm:w-5 sm:h-5" />
            {/* Responsive icon */}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-3 sm:p-4">
          {/* Header */}
          <CardHeader className="p-0 pb-1 sm:pb-2">
            <CardTitle className="group-hover:text-ch-blue-50 dark:group-hover:text-ch-blue-light transition-colors duration-200">
              {product.name}
            </CardTitle>
            {product.category?.name && (
              <CardDescription className="mb-1 mt-0.5 sm:mt-1">
                {product.category.name}
              </CardDescription>
            )}
          </CardHeader>

          {/* Content */}
          <CardContent className="p-0 pb-1 sm:pb-2 flex-grow">
            <p
              className={cn(
                "font-bold text-ch-red dark:text-ch-red-light",
                "text-lg sm:text-xl mb-1 sm:mb-2"
              )}
            >
              {formatPrice(product.base_price)} {/* Now displays in VND */}
            </p>
            {/* Placeholders */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-2 sm:gap-x-3 mt-1",
                "text-[10px] sm:text-xs"
              )}
            >
              <span className="flex items-center whitespace-nowrap text-gray-400 dark:text-gray-500">
                <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 text-yellow-400" />
                {/* You might want to replace these with actual data if available */}
                <span>
                  {product.averageRating?.toFixed(1) || "N/A"} (
                  {product.numberOfReviews || 0})
                </span>
              </span>
              <span className="flex items-center whitespace-nowrap text-gray-400 dark:text-gray-500">
                <BagIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                {/* Replace with actual sales data if available */}
                <span>500+ sold</span>
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </CardBorder>
  );
};

export default ProductCard;
