import * as React from "react";
import { cn } from "@/lib/utils"; // Your utility function

// Define the props for the Card component
interface GradientHoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Add any specific props for this card variant if needed later
}

const GradientHoverCard = React.forwardRef<
  HTMLDivElement,
  GradientHoverCardProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-transparent", // Rounded, transparent border initially
      "bg-gradient-to-br from-white via-white to-gray-100", // Subtle white/light gray gradient base
      "dark:from-gray-800 dark:via-gray-900 dark:to-black", // Dark mode gradient
      "p-6 shadow-md", // Padding and initial shadow
      "transition-all duration-300 ease-in-out", // Smooth transition for hover effects
      "hover:shadow-xl hover:shadow-indigo-500/30", // Increase shadow size and add colored glow on hover
      "hover:scale-[1.03]", // Slightly scale up on hover
      "hover:border-gray-300 dark:hover:border-gray-700", // Make border visible on hover
      "cursor-pointer", // Indicate interactivity
      className // Merge custom classes passed via the className prop
    )}
    {...props}
  >
    {/* We still render children for content flexibility */}
    {children}
  </div>
));
GradientHoverCard.displayName = "GradientHoverCard";

// You can still define and export optional sub-components if desired,
// similar to the basic card, adjusting their styles if needed.
// For simplicity, this example focuses on the main container card.

export { GradientHoverCard };
