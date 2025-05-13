import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoriesList from "@/features/category/components/CategoriesList";
import ProductsList from "@/features/products/components/ProductsList";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductBySearchQuery } from "@/services/product/getProductBySearchQuery";
import { Product, Category } from "@/types/dataTypes";
import { cn } from "@/lib/utils";

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cn("w-5 h-5", className)}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />{" "}
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
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0h9.75m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
    />{" "}
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
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />{" "}
  </svg>
);

const ProductsPage = () => {
  const location = useLocation();
  // Re-introduce queryParams state to pass down
  const [queryParams, setQueryParams] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Re-introduce useEffect to sync URL changes to queryParams state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Optional: Define relevant keys if needed, otherwise use all params
    // const relevantKeys = ['category', 'searchText', 'brand', 'sort', 'page', 'minPrice', 'maxPrice'];
    // const relevantParams = new URLSearchParams();
    // relevantKeys.forEach(key => {
    //     if (params.has(key)) {
    //         relevantParams.set(key, params.get(key)!);
    //     }
    // });
    // setQueryParams(relevantParams.toString());
    setQueryParams(params.toString()); // Simpler: use all params from URL
  }, [location.search]);

  const {
    data: categoriesData = [] as Category[],
    isError: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery();

  const {
    data: products = [] as Product[],
    isError: productsError,
    isLoading: productsLoading,
    // Pass the state variable to the query hook
  } = useGetProductBySearchQuery(queryParams);

  if (categoriesLoading) {
    return <p className="text-center text-gray-600 p-10">Loading Filters...</p>;
  }
  if (categoriesError) {
    return (
      <p className="text-center text-ch-red p-10">Error Loading Filters.</p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-ch-red-10">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-ch-blue text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue"
        aria-label="Open filters"
      >
        <FilterIcon />
      </button>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          aria-hidden="true"
        ></div>
      )}

      <div
        className={cn(
          "bg-white h-44",
          "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0 md:w-64 lg:w-72 md:flex-shrink-0 md:flex md:flex-col",
          "border-r border-gray-200 "
        )}
      >
        <div className="p-4 flex-grow overflow-y-auto">
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800">
            Categories
          </h3>
          {/* Pass required props to CategoriesList */}
          <CategoriesList
            data={categoriesData}
            queryParams={queryParams}
            setQueryParams={setQueryParams}
          />
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-ch-red-10 min-h-screen">
        {productsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        )}
        {productsError && !productsLoading && (
          <p className="text-center text-ch-red p-10">
            Could not load products.
          </p>
        )}
        {!productsLoading && !productsError && (
          <>
            {products && products.length > 0 ? (
              <ProductsList data={products} />
            ) : (
              <div className="text-center text-gray-500 mt-10">
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

export default ProductsPage;
