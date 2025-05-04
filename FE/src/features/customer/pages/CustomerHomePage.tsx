// src/features/customer/pages/CustomerHomePage.tsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// --- Shadcn/ui Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// --- Icons ---
// Ví dụ: import { Truck, ShieldCheck, MessageSquare } from 'lucide-react';

// --- Hooks & Utilities ---
import { useGetHomePageQuery } from "@/services/homePage/getHomePageQuery";
import { useGetRecommendationProductQuery } from "@/services/recommendation/getRecommendationProductQuery";
import { useGetAllProductsQuery } from "@/services/product/getAllProductsQuery";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { getAuthCredentials } from "@/utils/authUtil";

// --- Types ---
import {
  Product,
  Category,
  HomePageItem,
  CategoryReference,
} from "@/types/dataTypes";

// --- Component ---
const CustomerHomePage: React.FC = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  // --- Số lượng sản phẩm tối đa muốn hiển thị ---
  const MAX_PRODUCTS_TO_SHOW = 8; // Đặt số lượng tiêu chuẩn ở đây

  useEffect(() => {
    const credentials = getAuthCredentials();
    if (credentials.userInfo?._id) {
      setUserId(credentials.userInfo._id);
    }
  }, []);

  // --- Data Fetching ---
  const { data: homePageDataResult, isLoading: isLoadingHomePage } =
    useGetHomePageQuery();
  const homePageData = homePageDataResult as
    | {
        banners: HomePageItem[];
        features: HomePageItem[];
        videos: HomePageItem[];
      }
    | undefined;

  // Fetch Recommendations
  const {
    data: recommendedProducts,
    isLoading: isLoadingRecommendations,
    isError: isErrorRecommendations,
    isSuccess: isSuccessRecommendations,
  } = useGetRecommendationProductQuery(userId);

  // Điều kiện để kích hoạt fetch fallback products
  const enableFallback = !userId || (!!userId && isErrorRecommendations);

  // Fetch Fallback Products
  const {
    data: fallbackProducts,
    isLoading: isLoadingFallback,
    isSuccess: isSuccessFallback,
  } = useGetAllProductsQuery({
    limit: MAX_PRODUCTS_TO_SHOW, // Cố gắng lấy đúng số lượng từ API
    // SỬA LỖI TYPESCRIPT: Ép kiểu tường minh sang boolean cho enabled
    enabled: Boolean(enableFallback),
  });

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery({ limit: 6 });
  const categories: Category[] | undefined = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data;

  // --- Logic xác định sản phẩm và trạng thái loading ---
  const shouldUseRecommendations =
    !!userId && isSuccessRecommendations && !isErrorRecommendations;
  const shouldUseFallback = enableFallback && isSuccessFallback;

  const productsToShowSource: Product[] | undefined = shouldUseRecommendations
    ? recommendedProducts
    : shouldUseFallback
    ? fallbackProducts
    : undefined;

  // Xác định trạng thái loading tổng thể chính xác hơn
  let isLoadingProducts = isLoadingHomePage; // Bắt đầu bằng loading homepage
  if (userId) {
    isLoadingProducts = isLoadingProducts || isLoadingRecommendations; // Nếu có userId, phụ thuộc recommendations
  }
  if (enableFallback) {
    isLoadingProducts = isLoadingProducts || isLoadingFallback; // Nếu fallback được enable, phụ thuộc fallback
  }
  // Hoặc đơn giản hơn nếu không muốn phụ thuộc isLoadingHomePage:
  // const isLoadingProducts = (!!userId && isLoadingRecommendations) || (enableFallback && isLoadingFallback);

  // --- Render Helper Functions ---
  const renderProductCard = (product: Product) => (
    <Card
      key={product._id}
      className="overflow-hidden group border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      <Link to={`/product/${product._id}`} className="block flex-grow">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0] || "/images/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <CardContent className="p-3 space-y-1 flex flex-col flex-grow">
          {product.category && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {(product.category as CategoryReference)?.name || "Danh mục"}
            </p>
          )}
          <h3 className="font-medium text-sm truncate group-hover:text-ch-blue transition-colors flex-grow">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <p className="font-semibold text-base text-ch-red">
              {product.base_price.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  const renderSkeletonCard = (key: number) => (
    <div key={key} className="space-y-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );

  // --- Main Component Return ---
  return (
    <div className="space-y-10 md:space-y-16 pb-16">
      {/* --- Hero Section --- */}
      <section className="relative -mt-px">
        {isLoadingHomePage ? (
          <Skeleton className="w-full h-[35vh] md:h-[55vh] lg:h-[70vh]" />
        ) : homePageData?.banners && homePageData.banners.length > 0 ? (
          <Carousel
            opts={{ loop: true, align: "start" }}
            className="w-full overflow-hidden"
          >
            <CarouselContent>
              {homePageData.banners.map((banner: HomePageItem) => (
                <CarouselItem key={banner._id}>
                  <div className="relative w-full h-[35vh] md:h-[55vh] lg:h-[70vh] bg-cover bg-center flex items-center">
                    <img
                      src={banner.photo_url || "/images/default-banner.jpg"}
                      alt={banner.title || "Banner"}
                      className="absolute inset-0 w-full h-full object-cover -z-10"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 text-left max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 w-full">
                      <div className="max-w-lg md:max-w-xl">
                        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 drop-shadow-lg leading-tight">
                          {banner.title}
                        </h1>
                        <p className="text-white/90 text-sm md:text-base lg:text-lg mb-5 md:mb-7 drop-shadow">
                          {banner.description}
                        </p>
                        <Button
                          size="lg"
                          className="bg-white text-black hover:bg-gray-200"
                          asChild
                        >
                          <Link to={"#"}> Mua ngay </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {homePageData.banners.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 hidden md:inline-flex bg-white/70 hover:bg-white text-black" />
                <CarouselNext className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 hidden md:inline-flex bg-white/70 hover:bg-white text-black" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-[35vh] md:h-[55vh] lg:h-[70vh] bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Không có banner.</p>
          </div>
        )}
      </section>

      {/* --- Featured Categories --- */}
      <section className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8">
          Danh mục Nổi bật
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-5">
          {isLoadingCategories
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2 flex flex-col items-center">
                  <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            : (categories || []).map((category: Category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="flex flex-col items-center text-center group p-2"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-100 mb-2 border-2 border-transparent group-hover:border-ch-blue transition-colors flex items-center justify-center shadow-sm">
                    <img
                      src={`/images/category-placeholder.png`}
                      alt={category.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs md:text-sm font-medium group-hover:text-ch-blue transition-colors line-clamp-2">
                    {category.name}
                  </p>
                </Link>
              ))}
        </div>
      </section>

      {/* --- Recommended/Featured Products --- */}
      <section className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8">
          {/* Tiêu đề thay đổi tùy thuộc vào nguồn dữ liệu */}
          {shouldUseRecommendations ? "Dành cho bạn" : "Hàng Mới Về"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoadingProducts ? (
            // Hiển thị skeleton khi đang tải, số lượng dựa trên MAX_PRODUCTS_TO_SHOW
            Array.from({ length: MAX_PRODUCTS_TO_SHOW }).map((_, i) =>
              renderSkeletonCard(i)
            )
          ) : // Kiểm tra nếu có dữ liệu nguồn
          productsToShowSource && productsToShowSource.length > 0 ? (
            // **GIỚI HẠN CLIENT-SIDE:** Dùng slice để chỉ lấy số lượng sản phẩm tiêu chuẩn
            productsToShowSource
              .slice(0, MAX_PRODUCTS_TO_SHOW)
              .map(renderProductCard)
          ) : (
            // Hiển thị nếu không có sản phẩm nào từ cả hai nguồn
            <p className="col-span-full text-center text-gray-500 py-8">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          )}
        </div>
        {/* Nút Xem thêm: Chỉ hiển thị khi không loading VÀ có dữ liệu sản phẩm nguồn */}
        {!isLoadingProducts &&
          productsToShowSource &&
          productsToShowSource.length > 0 && (
            <div className="text-center mt-8 md:mt-10">
              <Button variant="outline" size="lg" asChild>
                <Link to="/products">Xem tất cả sản phẩm</Link>
              </Button>
            </div>
          )}
      </section>

      {/* --- Promotional Section --- */}
      {!isLoadingHomePage &&
        homePageData?.features &&
        homePageData.features.length > 0 && (
          <section className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8">
              Ưu đãi Đặc biệt
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {homePageData.features.map((feature: HomePageItem) => (
                <div
                  key={feature._id}
                  className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video md:aspect-[16/7] group shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={
                      (feature as any).image_url ||
                      "/images/feature-placeholder.png"
                    }
                    alt={feature.title || "Promotion"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 -z-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent group-hover:from-black/70 transition-all duration-300"></div>
                  <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-4 md:p-8 text-white max-w-xs md:max-w-sm">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-1 md:mb-2 drop-shadow">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/90 mb-3 md:mb-4 drop-shadow line-clamp-2">
                      {feature.description}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="self-start mt-auto md:mt-0 bg-white/90 text-black hover:bg-white"
                      asChild
                    >
                      <Link to={"#"}> Xem ngay </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* --- Why Choose Us Section --- */}
      <section className="bg-gray-50 py-10 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-8 md:mb-10">
            Tại sao chọn Chúng tôi?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                {" "}
                i{" "}
              </div>
              <div>
                <h3 className="font-medium text-base mb-1">
                  Giao hàng Nhanh & Miễn phí
                </h3>
                <p className="text-gray-600 text-sm">
                  Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                {" "}
                i{" "}
              </div>
              <div>
                <h3 className="font-medium text-base mb-1">
                  Chất lượng Đảm bảo
                </h3>
                <p className="text-gray-600 text-sm">
                  100% sản phẩm chính hãng, nguồn gốc xuất xứ rõ ràng.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                {" "}
                i{" "}
              </div>
              <div>
                <h3 className="font-medium text-base mb-1">
                  Hỗ trợ Khách hàng 24/7
                </h3>
                <p className="text-gray-600 text-sm">
                  Đội ngũ CSKH chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHomePage;
