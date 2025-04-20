// src/components/shared/ProductCard.tsx (Adjust path as needed)
import { IoCartOutline } from "react-icons/io5";
import React, { useState, useRef, MouseEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardBorder,
  // CardFooter, // Removed as the button is gone
} from "@/components/ui/Card"; // Import the composable components
import { ProductData } from "@/types/dataTypes"; // Adjust import path
import { cn } from "@/lib/utils"; // Adjust import path

// --- Helper: Price Formatting ---
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

// --- Helper: Placeholder Icons ---
const StarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={cn("w-4 h-4", className)}
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
    className={cn("w-4 h-4", className)}
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
  product: ProductData;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation values (adjust multiplier for sensitivity)
    const rotateY = (mouseX / width - 0.5) * 25; // Tilt left/right
    const rotateX = -(mouseY / height - 0.5) * 25; // Tilt up/down

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 }); // Reset tilt
  };

  const imageUrl = product.images?.[0] || "/placeholder-image.png";

  // --- Add to Cart Click Handler (Placeholder) ---
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click events if needed
    e.preventDefault(); // Prevent potential navigation if wrapped in link
    console.log(`Add ${product.name} (ID: ${product._id}) to cart`);
    // Add your actual add to cart logic here (e.g., call mutation)
  };

  return (
    <CardBorder
      className={cn(
        "bg-gradient-to-br from-ch-red to-ch-blue rounded-lg",
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x / 10}deg) rotateY(${
          rotate.y / 10
        }deg) scale3d(1, 1, 1)`, // Apply tilt dynamically
        transformStyle: "preserve-3d", // Important for perspective
        transition: "transform 0.1s ease-out", // Smooth reset on mouse leave
      }}
    >
      <Card
        ref={cardRef}
        className={cn(
          "group relative overflow-hidden", // Keep group, add relative and overflow-hidden
          "transition-transform duration-150 ease-out", // Smooth transition for reset
          "border-0",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section - Stays mostly the same */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={product.name}
            // Make image less reactive to direct hover, rely on card hover
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          {/* Optional: Tag/Badge - Use accent-red */}
          {product.tags?.[0] && (
            <span className="absolute top-2 left-2 bg-accent-red text-white text-xs font-semibold px-2 py-1 rounded z-10 shadow-sm">
              {product.tags[0]}
            </span>
          )}
          {/* Optional: Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* --- Cart Icon on Hover --- */}
          <button
            onClick={handleAddToCartClick}
            aria-label={`Add ${product.name} to cart`}
            className={cn(
              "absolute bottom-2 right-2 z-20 p-2 rounded-full shadow-md",
              "bg-ch-blue-100 text-white", // Use blue for the button
              "opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0", // Appear from bottom
              "transition-all duration-300 ease-in-out",
              "hover:bg-ch-blue scale-100 hover:scale-110" // Hover effect on icon itself
            )}
          >
            <IoCartOutline />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-4">
          {" "}
          {/* Add flex-grow to push footer (if any) */}
          {/* Header with Category and Title */}
          <CardHeader className="p-0 pb-2">
            <CardTitle className="group-hover:text-accent-blue">
              {product.name}
            </CardTitle>
            {product.category?.name && (
              <CardDescription className="mb-1">
                {product.category.name}
              </CardDescription>
            )}
          </CardHeader>
          {/* Content with Price and Placeholders */}
          <CardContent className="p-0 pb-2 flex-grow">
            {" "}
            {/* Added flex-grow */}
            <p className="text-xl font-bold text-accent-red dark:text-accent-red-light mb-2">
              {formatPrice(product.base_price)}
            </p>
            {/* --- Placeholder for Reviews/Purchases --- */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center">
                <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
                <span>4.5 (120)</span> {/* Placeholder */}
              </span>
              <span className="flex items-center">
                <BagIcon className="w-4 h-4 mr-1 text-gray-400" />
                <span>500+ sold</span> {/* Placeholder */}
              </span>
            </div>
          </CardContent>
          {/* Footer removed as button moved to image */}
          {/* If you need a footer for other things, add CardFooter here */}
          {/* <CardFooter className="p-0 pt-2 mt-auto">...</CardFooter> */}
        </div>
      </Card>
    </CardBorder>
  );
};

export default ProductCard;
