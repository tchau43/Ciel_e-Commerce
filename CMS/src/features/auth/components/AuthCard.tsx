// src/components/ui/AuthCard.tsx (New File)
import React from "react";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string; // Allow passing additional classes to the card itself
}
export const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    // Outer container to center everything on the page
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-950">
      {/* Relative container for positioning glow and card */}
      <div className="relative w-full max-w-lg">
        {/* Background Glow Effects */}
        {/* These are positioned absolutely relative to the container above */}
        {/* They are placed *before* the card content in the DOM */}
        <div
          aria-hidden="true"
          // className="absolute inset-0 overflow-hidden -z-10" // Position behind card content
        >
          {/* Blue Glow - Top Leftish */}
          <div
            className={cn(
              "absolute -top-20 -left-20 h-[250px] w-[250px] sm:h-[350px] sm:w-[350px]", // Size, offset top-left
              "rounded-full", // Make it round
              // Use direct hex in arbitrary value for reliability
              "bg-[radial-gradient(circle,var(--color-ch-blue-100)_20%,transparent_70%)]",
              // Or direct hex: `bg-[radial-gradient(circle,#EFF6FF_20%,transparent_70%)]`,
              "blur-[80px] sm:blur-[100px]", // Blur amount
              "opacity-30 dark:opacity-20" // Adjust opacity
            )}
          />
          {/* Red Glow - Bottom Rightish */}
          <div
            className={cn(
              "absolute -bottom-20 -right-20 h-[250px] w-[250px] sm:h-[350px] sm:w-[350px]", // Size, offset bottom-right
              "rounded-full",
              // Use direct hex in arbitrary value for reliability
              "bg-[radial-gradient(circle,var(--color-ch-red-100)_20%,transparent_70%)]",
              // Or direct hex: `bg-[radial-gradient(circle,#FEF2F2_20%,transparent_70%)]`,
              "blur-[80px] sm:blur-[100px]",
              "opacity-30 dark:opacity-20"
            )}
          />
        </div>

        {/* Card Content Area */}
        {/* This div holds the actual form, positioned above the glow */}
        <div
          className={cn(
            "relative z-10", // Ensure content is above the glow
            "bg-white dark:bg-gray-800", // Card background
            "rounded-xl shadow-xl", // Rounding and shadow
            "p-6 sm:p-8", // Padding inside the card
            className // Allow overriding/extending styles
          )}
        >
          {children} {/* Render the form passed into AuthCard */}
        </div>
      </div>
    </div> // End outer container
  );
};

// Optional: Export as default if it's the only export
// export default AuthCard;
