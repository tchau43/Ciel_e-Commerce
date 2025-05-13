// src/pages/recommendations/RecommendedProductsPage.tsx

import ProductCard from "@/features/components/ProductCard";
import { useGetRecommendationProductQuery } from "@/services/recommendation/getRecommendationProductQuery";
import { ProductData } from "@/types/dataTypes";
import { getAuthCredentials } from "@/utils/authUtil";

const RecommendedProductsPage = () => {
  const { userInfo } = getAuthCredentials();
  const userId = userInfo?._id;

  const {
    data: recommendedProducts,
    isLoading,
    isError,
    error,
  } = useGetRecommendationProductQuery(userId);

  if (!userId) {
    // Should be handled by routing/auth ideally, but good failsafe
    return (
      <div className="p-4 text-center text-red-500">
        Please log in to see recommendations.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading recommendations: {error.message}
      </div>
    );
  }

  const hasRecommendations =
    recommendedProducts && recommendedProducts.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Recommended For You
      </h1>

      {hasRecommendations ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product: ProductData) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-gray-50 rounded shadow-sm">
          <p className="text-xl text-gray-600">
            We don't have specific recommendations for you right now.
          </p>
          {/* Optionally link to general products page */}
        </div>
      )}
    </div>
  );
};

export default RecommendedProductsPage;
