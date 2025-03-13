import CategoriesList from "@/components/product/CategoriesList";
import ProductsList from "@/components/product/ProductsList";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductsByCategoryQuery } from "@/services/product/getProductsByCategoryQuery";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ProductPage = () => {
  const location = useLocation();
  const [queryParams, setQueryParams] = useState<string | null>(null); // State to store queryParams

  // Fetch category data
  const {
    data: categoriesData = [],
    isError: categoriesError,
    isLoading: categoriesLoading,
  } = useGetAllCategoriesQuery();

  // Fetch products based on categories
  const {
    data: productsData = [],
    isError: productsError,
    isLoading: productsLoading,
  } = useGetProductsByCategoryQuery(queryParams || "", {
    enabled: true, // Only enable query if queryParams exist
  });

  const handleSearchChange = () => {};

  // Extract query parameters from URL whenever location.search changes
  useEffect(() => {
    const newQueryParams = new URLSearchParams(location.search);
    console.log("newQueryParams", newQueryParams.toString());

    // Update queryParams state
    setQueryParams(newQueryParams.toString());
  }, [location.search]); // This runs whenever the URL query string changes

  // Loading state
  if (categoriesLoading || productsLoading) {
    return <p className="text-center text-gray-600">Loading data...</p>;
  }

  // Error handling
  if (categoriesError || productsError) {
    return <p className="text-center text-red-600">Something went wrong...</p>;
  }

  return (
    <>
      <div className="size-full flex justify-between">
        <div>
          <div className="mb-4">
            <label htmlFor="searchBox">Search:</label>
            <input
              onChange={handleSearchChange}
              className="border rounded-md px-2 py-1"
              id="searchBox"
              type="text"
              placeholder="Enter name, price, category, tags ..."
            />
          </div>
          <div>
            <CategoriesList
              data={categoriesData}
              setQueryParams={setQueryParams}
              queryParams={queryParams} // Passing queryParams to CategoriesList
            />
          </div>
        </div>
        <div className="w-full">
          <ProductsList data={productsData} />
        </div>
      </div>
    </>
  );
};

export default ProductPage;
