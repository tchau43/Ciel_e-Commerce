// src/components/ui/Card.tsx (Example path)
import * as React from "react";
import { cn } from "@/lib/utils"; // Ensure this path is correct

interface CardBorderProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardBorder = React.forwardRef<HTMLDivElement, CardBorderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "p-[1px] bg-gradient-to-br from-ch-red to-ch-blue rounded-lg", // Ensure cards in a grid have consistent height
        className
      )}
      {...props}
    ></div>
  )
);
CardBorder.displayName = "CardBorder";

// --- Card Root ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base structure & theme adaptability (you might adjust dark mode classes)
        "rounded-lg border text-card-foreground shadow-md transition-shadow duration-300 ease-in-out",
        "hover:shadow-xl", // Enhance shadow on hover
        "bg-gray-800 dark:bg-white", // Or use dark:bg-gray-50 if you prefer off-white
        "flex flex-col h-full", // Ensure cards in a grid have consistent height
        className
      )}
      {...props}
    ></div>
  )
);
Card.displayName = "Card";

// --- Card Header ---
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      // Adjust padding as needed, removed default p-6 for more flexibility
      className={cn("flex flex-col space-y-1.5 p-4 pb-2", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

// --- Card Title ---
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        // Custom styles for title - using blue on hover via group-hover on Card
        "text-lg font-semibold leading-none tracking-tight dark:text-gray-800 text-gray-100",
        "group-hover:text-gray-300 transition-colors duration-200", // Use custom blue on hover
        "line-clamp-2", // Prevent overly long titles breaking layout
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = "CardTitle";

// --- Card Description (Can be used for category/brand etc.) ---
interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      // Custom style - using dark blue for subtlety
      "text-xs font-medium uppercase tracking-wider dark:text-gray-800 text-gray-100",
      className
    )}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

// --- Card Content ---
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  // Adjusted padding, remove default p-6 for more flexibility
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 pt-2 flex-grow", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// --- Card Footer (Good for action buttons) ---
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      // Adjusted padding, ensure it's at the bottom
      className={cn("flex items-center p-4 pt-2 mt-auto", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBorder,
};
