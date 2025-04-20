import React from "react";
import { GradientHoverCard } from "@/components/ui/GradientHoverCard"; // Adjust import path

// Assuming you have CardTitle, CardDescription etc. or just use standard elements
import { CardTitle, CardDescription } from "@/components/ui/Card"; // Can reuse sub-components

const Button = ({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ${
      className || ""
    }`}
    {...props}
  />
);

const TestComponent: React.FC = () => {
  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GradientHoverCard onClick={() => alert("Card Clicked!")}>
        {/* You can structure content freely or use sub-components */}
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Interactive Card
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This card uses gradients and hover effects for a more dynamic feel.
          Click me!
        </p>
        <Button>Learn More</Button>
      </GradientHoverCard>

      <GradientHoverCard className="from-green-50 via-white to-white dark:from-green-900/50 dark:via-gray-900">
        {/* Using reused sub-components */}
        <CardTitle className="text-green-800 dark:text-green-300">
          Custom Gradient
        </CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-400">
          You can override the gradient and other styles using the className
          prop.
        </CardDescription>
      </GradientHoverCard>

      <GradientHoverCard>
        <img
          src="/placeholder.jpg"
          alt="Placeholder"
          className="rounded-lg mb-4 shadow-sm"
        />
        <CardTitle>Card with Image</CardTitle>
        <CardDescription>Images look great in these cards too.</CardDescription>
      </GradientHoverCard>
    </div>
  );
};

export default TestComponent;
