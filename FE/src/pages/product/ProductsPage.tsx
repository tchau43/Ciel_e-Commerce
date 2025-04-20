import CategoriesList from "@/components/product/CategoriesList";
// import ProductsList from "@/components/product/ProductsList"; // If not needed
import ProductCard from "@/components/shared/ProductCard"; // Corrected path based on your code
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductBySearchQuery } from "@/services/product/getProductBySearchQuery";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProductData } from "@/types/dataTypes"; // Ensure ProductData is imported

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [queryParams, setQueryParams] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");

  // Fetch category data
  const {
    data: categoriesData = [],
    isError: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery();

  // Unified products query - Ensure it returns ProductData[]
  const {
    data: products = [] as ProductData[],
    isError: productsError,
    isLoading: productsLoading,
  } = useGetProductBySearchQuery(queryParams);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(queryParams);
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
  };

  // Sync state with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.delete("_t");
    setQueryParams(params.toString());
    setSearchInput(params.get("searchText") || "");
  }, [location.search]);

  // Combined Loading/Error checks
  if (categoriesLoading || productsLoading) {
    return <p className="text-center text-gray-600 p-10">Loading data...</p>;
  }

  if (categoriesError || productsError) {
    return (
      <p className="text-center text-red-600 p-10">Something went wrong...</p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row size-full">
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 md:mr-8 mb-6 md:mb-0 flex-shrink-0 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
        {/* Search */}
        <div className="mb-6">
          <label
            htmlFor="searchBox"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search Products
          </label>
          <div className="flex flex-col">
            <input
              onChange={handleSearchChange}
              value={searchInput}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent-blue focus:border-accent-blue dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              id="searchBox"
              type="text"
              placeholder="Name, category, tag..."
            />
            <button
              className="px-4 py-2 border border-l-0 border-accent-blue bg-accent-blue text-white rounded-r-md hover:bg-accent-blue-dark focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors duration-200"
              type="button"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Categories */}
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Categories
        </h3>
        <CategoriesList
          data={categoriesData}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
      </div>

      {/* Main Product Display Area */}
      <div className="flex-1 p-4">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add the type annotation here: */}
            {products.map((product: ProductData) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            <p className="text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
