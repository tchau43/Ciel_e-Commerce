// ./src/components/ui/FloatingLabelInput.tsx (Example file path)

import * as React from "react";
import { cn } from "@/lib/utils"; // Ensure this path is correct

// Define more specific props for a controlled input experience
interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; // Input ID is required for label association
  label: string; // Label text is required
  containerClassName?: string; // Optional class for the main container div
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(
  (
    { className, containerClassName, id, label, type = "text", ...props },
    ref // Forward ref to the actual input element
  ) => {
    return (
      // Container div needs relative positioning for the absolute label
      <div className={cn("relative", containerClassName)}>
        <input
          ref={ref} // Attach the ref to the input
          type={type}
          id={id} // Assign the id to the input
          className={cn(
            // --- Base Styles ---
            "peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent",
            // --- Padding ---
            // Adjusted padding: More top padding for label's default state, less bottom
            "px-3 py-2",
            // --- Placeholder ---
            // Use a space as placeholder for :placeholder-shown to work, but make it visually transparent
            "placeholder-transparent focus:placeholder-transparent",
            // --- Focus Styles ---
            "focus:border-blue-500 focus:outline-none focus:ring-0 dark:focus:border-blue-500",
            // --- Dark Mode ---
            "dark:border-gray-600",
            // --- External Classes ---
            "text-sm",
            className // Allow specific input styling overrides
          )}
          placeholder=" " // IMPORTANT: Must have a non-empty placeholder (space works)
          {...props} // Spread other native input props (value, onChange, required, etc.)
        />
        <label
          htmlFor={id} // Connect label to input for accessibility
          className={cn(
            // --- Base & Positioning ---
            "absolute left-3 top-3 z-10 origin-[0] transform cursor-text px-1", // Position like placeholder, allow text cursor
            "transition-all duration-200 ease-in-out", // Smooth animation
            "pointer-events-none", // Let clicks fall through to the input below
            // --- Text Styling (Default - Placeholder Look) ---
            "text-sm text-gray-500 dark:text-gray-400",
            // --- Transformations (Default - Placeholder Look) ---
            "-translate-y-0 scale-100",

            // --- Floating Label Styles (When input is focused OR has value) ---
            // Move label up and shrink it on focus
            "peer-focus:-translate-y-6 peer-focus:scale-[0.8]",
            // Also move label up and shrink it when placeholder is NOT shown (input has value)
            "peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-[0.8]",

            // --- Text Styling (Floating State) ---
            // Change color on focus
            "peer-focus:text-blue-600 dark:peer-focus:text-blue-500",
            // Optionally keep color changed if input has value but not focused (remove if not desired)
            // 'peer-[:not(:placeholder-shown)]:text-gray-600 dark:peer-[:not(:placeholder-shown)]:text-gray-400',

            // Add background matching card bg only when floated to "cutout" the border
            "peer-focus:bg-white dark:peer-focus:bg-gray-900", // Match these BGs to your card/page BG
            "peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-900" // Match these BGs to your card/page BG
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

// Export using a descriptive name
export { FloatingLabelInput };

/*
// --- How to use it ---

function MyForm() {
  const [name, setName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <form className="p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-sm mx-auto">
      <FloatingLabelInput
        ref={inputRef}
        id="name"
        label="Your Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required // Example: Mark as required
        containerClassName="mt-4" // Add margin to the container
      />

      <FloatingLabelInput
        id="email"
        label="Email Address"
        type="email"
        // Example of controlled input without state in this example
        // value={...}
        // onChange={...}
      />

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Submit
      </button>
    </form>
  );
}

*/
