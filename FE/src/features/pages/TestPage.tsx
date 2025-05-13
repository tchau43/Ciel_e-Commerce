import React, { useEffect, useState, ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoriesList from "@/features/category/components/CategoriesList";
import ProductsList from "@/features/products/components/ProductsList"; // Using the updated ProductsList
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductBySearchQuery } from "@/services/product/getProductBySearchQuery";
import { Product, Category } from "@/types/dataTypes"; // Updated import
import { cn } from "@/lib/utils";

// --- Helper Icons (Define or import from react-icons) ---
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
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0h9.75m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
    />
  </svg>
);

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-6 h-6", className)}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

// Renamed component
const TestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queryParams, setQueryParams] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile toggle state

  // --- Keep your existing data fetching hooks ---
  const {
    data: categoriesData = [] as Category[], // Updated type
    isError: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery();
  const {
    data: products = [] as Product[], // Updated type
    isError: productsError,
    isLoading: productsLoading,
  } = useGetProductBySearchQuery(queryParams);

  // --- Keep your existing handlers ---
  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearchSubmit = () => {
    // Renamed from handleSearch
    const params = new URLSearchParams(location.search); // Use location.search to preserve category params
    const searchText = searchInput.trim();
    if (searchText) {
      params.set("searchText", searchText);
    } else {
      params.delete("searchText");
    }
    if (params.toString() || searchText) {
      params.set("_t", Date.now().toString());
    } else {
      params.delete("_t");
    }
    navigate(`?${params.toString()}`, { replace: true });
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // --- Keep your useEffect hook ---
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.delete("_t");
    setQueryParams(params.toString());
    setSearchInput(params.get("searchText") || "");
  }, [location.search]);

  // --- Loading & Error Handling (can be refined) ---
  if (categoriesLoading) {
    // Consider a skeleton loader for the whole page layout
    return <p className="text-center text-gray-600 p-10">Loading Filters...</p>;
  }
  if (categoriesError) {
    return (
      <p className="text-center text-red-600 p-10">Error Loading Filters.</p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-red-400\">
      {/* Ensure full height */}
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-ch-blue text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue"
        aria-label="Open filters"
      >
        <FilterIcon />
      </button>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          aria-hidden="true"
        ></div>
      )}
      {/* --- Sidebar --- */}
      <div
        className={cn(
          "bg-white",
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0 md:w-64 lg:w-72 md:flex-shrink-0 md:flex md:flex-col", // Ensure flex column on desktop
          "h-4"
        )}
      >
        <div className="p-4 relative h-4 flex flex-col max-w-full">
          {/* Close button for mobile */}
          {/* <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-2 right-2 md:hidden p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ch-blue"
            aria-label="Close filters"
          >
            <CloseIcon />
          </button> */}

          {/* Categories Section */}
          <div className="flex-grow flex flex-col">
            {/* Allow category list to grow */}
            <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 ">
              Categories
            </h3>
            {/* Pass setQueryParams directly as requested */}
            {/* Assuming CategoriesList knows how to use this to update URL */}
            <div className="flex-grow overflow-y-auto">
              {/* Make list scrollable if sidebar height is limited */}
              <CategoriesList
                data={categoriesData}
                queryParams={queryParams}
                setQueryParams={setQueryParams} // Pass the original setter
              />
            </div>
          </div>
        </div>
      </div>
      {/* --- Main Content Area --- */}
      {/* Added padding and allow vertical scroll */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Loading state for products */}
        {productsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        )}
        {/* Error state for products */}
        {productsError && !productsLoading && (
          <p className="text-center text-red-600 p-10">
            Could not load products.
          </p>
        )}
        {/* Product List or No Products Message */}
        {!productsLoading && !productsError && (
          <>
            {products && products.length > 0 ? (
              <ProductsList data={products} /> // Use the updated ProductsList
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                <p className="text-lg">
                  No products found matching your criteria.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TestPage; // Export with the new name
