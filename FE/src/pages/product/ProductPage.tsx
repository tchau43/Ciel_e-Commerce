import CategoriesList from "@/components/product/CategoriesList";
import ProductsList from "@/components/product/ProductsList";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductBySearchQuery } from "@/services/product/getProductBySearchQuery";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProductPage = () => {
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

  // Unified products query
  const {
    data: products = [],
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

    // const newParams = params.toString();
    // setQueryParams(newParams);
    // navigate(`?${newParams}`, { replace: true });
    if (params.toString()) {
      params.set("_t", Date.now().toString());
    }
    // console.log(">>>>>>>>>>>>>>>>params", params.toString());
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Sync state with URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.delete("_t"); // Remove timestamp before updating state

    setQueryParams(params.toString());
    setSearchInput(params.get("searchText") || "");
  }, [location.search]);

  // Loading states
  if (categoriesLoading || productsLoading) {
    return <p className="text-center text-gray-600">Loading data...</p>;
  }

  // Error states
  if (categoriesError || productsError) {
    return <p className="text-center text-red-600">Something went wrong...</p>;
  }

  return (
    <div className="size-full flex justify-between">
      <div>
        <div className="mb-4">
          {/* <label htmlFor="searchBox">Search:</label> */}
          <input
            onChange={handleSearchChange}
            value={searchInput}
            // onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            //   console.log("Key pressed:", e.key); // Debug all keys
            //   if (e.key === "Enter") {
            //     e.preventDefault(); // ⚠️ Always include this
            //     console.log("Enter key detected");
            //     handleSearch();
            //   }
            // }}
            className="border rounded-md px-2 py-1"
            id="searchBox"
            type="text"
            placeholder="Enter name, price, category, tags ..."
          />
          <button
            className="border rounded-md text-sm px-2 py-1 bg-gray-300"
            type="button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <CategoriesList
          data={categoriesData}
          queryParams={queryParams}
          setQueryParams={setQueryParams}
        />
      </div>
      <div className="flex-1">
        <ProductsList data={products} />
      </div>
    </div>
  );
};

export default ProductPage;
