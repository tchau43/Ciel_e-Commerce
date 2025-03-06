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
    data: productsDataByCate = [],
    isError: productsError,
    isLoading: productsLoading,
  } = useGetProductsByCategoryQuery(queryParams || "", {
    enabled: queryParams !== null, // Ensure we only query when queryParams are set
  });

  useEffect(() => {
    // Get query parameters from the URL
    const newQueryParams = new URLSearchParams(location.search);
    console.log("newQueryParams", newQueryParams.toString());

    // Update queryParams state with the stringified query params
    setQueryParams(newQueryParams.toString());
  }, [location.search]); // This runs whenever the location.search (URL) changes

  useEffect(() => {
    console.log("queryParams", queryParams);
  }, [queryParams]);

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
          <CategoriesList
            data={categoriesData}
            // You can pass the `onCategoryChange` prop to update selected categories if needed
          />
        </div>
        <div className="w-full">
          <ProductsList data={productsDataByCate} />
        </div>
      </div>
    </>
  );
};

export default ProductPage;

// import CategoriesList from "@/components/product/CategoriesList";
// import ProductsList from "@/components/product/ProductsList";
// import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
// import { useGetProductsByCategoryQuery } from "@/services/product/getProductsByCategoryQuery";
// import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// const ProductPage = () => {
//   const location = useLocation();
//   const [queryParams, setQueryParams] = useState<string | null>(null); // State to store queryParams

//   // Fetch category data
//   const {
//     data: categoriesData = [],
//     isError: categoriesError,
//     isLoading: categoriesLoading,
//   } = useGetAllCategoriesQuery();

//   // Fetch products based on categories
//   const {
//     data: productsData = [],
//     isError: productsError,
//     isLoading: productsLoading,
//   } = useGetProductsByCategoryQuery(queryParams || "", {
//     enabled: queryParams !== null && queryParams !== "", // Ensure the query is enabled only when queryParams are set
//   });

//   useEffect(() => {
//     // Get query parameters from the URL
//     console.log("location.search", location.search);
//     const newQueryParams = new URLSearchParams(location.search);

//     // Update queryParams state with the stringified query params
//     setQueryParams(newQueryParams.toString());
//   }, [location.search]); // This runs whenever the location.search (URL) changes

//   // Loading state
//   if (categoriesLoading || productsLoading) {
//     return <p className="text-center text-gray-600">Loading data...</p>;
//   }

//   // Error handling
//   if (categoriesError || productsError) {
//     return <p className="text-center text-red-600">Something went wrong...</p>;
//   }

//   return (
//     <>
//       <div className="size-full flex justify-between">
//         <div>
//           <CategoriesList
//             data={categoriesData}
//             // You can pass the `onCategoryChange` prop to update selected categories if needed
//           />
//         </div>
//         <div className="w-full">
//           <ProductsList data={productsData} />
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProductPage;
