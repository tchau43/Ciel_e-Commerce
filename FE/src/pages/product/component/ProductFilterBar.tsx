// src/components/product/ProductFilterBar.tsx (New file)
import React, { useState, useEffect, ChangeEvent } from "react";
import { CategoryData } from "@/types/dataTypes";
import { cn } from "@/lib/utils";

// --- Helper: Search Icon ---
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-5 h-5", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

// --- Helper: Filter Icon ---
const FilterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-5 h-5", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

// --- Component Props ---
interface ProductFilterBarProps {
  categoriesData: CategoryData[];
  searchInput: string;
  currentQueryParams: string; // Pass current params to derive initial state
  onSearchInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onFilterChange: (newQueryParams: string) => void; // Callback to update parent's queryParams
}

const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  categoriesData,
  searchInput,
  currentQueryParams,
  onSearchInputChange,
  onSearchSubmit,
  onFilterChange,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false); // For mobile toggle

  // Initialize selected categories based on URL query params when component mounts or params change
  useEffect(() => {
    const params = new URLSearchParams(currentQueryParams);
    const categoriesFromUrl = params.get("category")?.split(",") || [];
    setSelectedCategories(new Set(categoriesFromUrl));
  }, [currentQueryParams]);

  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    const newSelectedCategories = new Set(selectedCategories);
    if (isChecked) {
      newSelectedCategories.add(categoryId);
    } else {
      newSelectedCategories.delete(categoryId);
    }
    setSelectedCategories(newSelectedCategories);

    // Update URL parameters
    const params = new URLSearchParams(currentQueryParams);
    const categoryString = Array.from(newSelectedCategories).join(",");

    if (categoryString) {
      params.set("category", categoryString);
    } else {
      params.delete("category");
    }
    // Add timestamp to force refetch
    if (params.toString()) {
      params.set("_t", Date.now().toString());
    } else {
      params.delete("_t");
    }
    onFilterChange(params.toString()); // Call parent handler to trigger navigation/refetch
  };

  return (
    <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        {/* Text Search Input */}
        <div className="flex-grow mb-4 md:mb-0">
          <label htmlFor="searchBox" className="sr-only">
            {" "}
            {/* Screen reader only label */}
            Search Products
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </span>
            <input
              onChange={onSearchInputChange}
              value={searchInput}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit();
                }
              }}
              className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-ch-blue focus:border-ch-blue dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              id="searchBox"
              type="text"
              placeholder="Search by name, tag..."
            />
          </div>
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 mb-4"
        >
          <FilterIcon className="mr-2" />
          {showFilters ? "Hide" : "Show"} Filters
        </button>

        {/* Search Submit Button (Optional - Enter key works too) */}
        {/* Consider placing next to input or combining */}
        <button
          className="hidden md:inline-flex px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ch-blue hover:bg-ch-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue"
          type="button"
          onClick={onSearchSubmit}
        >
          Search
        </button>
      </div>

      {/* Category Checkboxes - Conditionally Shown */}
      <div
        className={cn(
          "mt-4 border-t border-gray-200 dark:border-gray-700 pt-4",
          "md:block", // Always block on medium screens and up
          showFilters ? "block" : "hidden" // Toggle visibility on small screens
        )}
      >
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Categories
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
          {categoriesData.map((category) => (
            <div key={category._id} className="flex items-center">
              <input
                id={`category-${category._id}`}
                name="category"
                type="checkbox"
                checked={selectedCategories.has(category._id)}
                onChange={(e) =>
                  handleCategoryChange(category._id, e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 text-ch-blue focus:ring-ch-blue dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-ch-blue dark:focus:ring-offset-gray-800"
              />
              <label
                htmlFor={`category-${category._id}`}
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilterBar;
