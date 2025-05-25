// src/features/customer/pages/CustomerHomePage.tsx

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetHomePageQuery } from "@/services/homePage/getHomePageQuery";
import { useGetRecommendationProductQuery } from "@/services/recommendation/getRecommendationProductQuery";
import { useGetAllProductsQuery } from "@/services/product/getAllProductsQuery";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { getAuthCredentials } from "@/utils/authUtil";
import { Product, Category, HomePageItem } from "@/types/dataTypes";
import ProductCard from "@/features/components/ProductCard";
import { gsap } from "gsap";
import { useGetFeaturedProductsQuery } from "@/services/product/getFeaturedProductsQuery";
import { formatCurrency } from "@/utils/formatCurrency";
import { ExpandableSection } from "@/components/ui/expandable-section";
import { Package } from "lucide-react";
import { CategoryShowcase } from "@/components/shared/CategoryShowcase";

const CustomerHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const MAX_PRODUCTS_TO_SHOW = 8;
  const featuresContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const credentials = getAuthCredentials();
    if (credentials.userInfo?._id) {
      setUserId(credentials.userInfo._id);
    }
  }, []);

  const { data: homePageDataResult, isLoading: isLoadingHomePage } =
    useGetHomePageQuery();
  const homePageData = homePageDataResult as
    | {
        banners: HomePageItem[];
        features: HomePageItem[];
        videos: HomePageItem[];
      }
    | undefined;

  const {
    data: recommendedProducts,
    isLoading: isLoadingRecommendations,
    isError: isErrorRecommendations,
    isSuccess: isSuccessRecommendations,
  } = useGetRecommendationProductQuery(userId);

  const enableFallback = !userId || (!!userId && isErrorRecommendations);

  const {
    data: fallbackProducts,
    isLoading: isLoadingFallback,
    isSuccess: isSuccessFallback,
  } = useGetAllProductsQuery({
    limit: MAX_PRODUCTS_TO_SHOW,
    enabled: Boolean(enableFallback),
  });

  const { data: categories, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery({ limit: 6 });

  const { data: featuredProducts, isLoading: isLoadingFeatured } =
    useGetFeaturedProductsQuery({
      limit: 10,
    });

  const { data: allProducts } = useGetAllProductsQuery({});

  // Tính toán số lượng sản phẩm cho mỗi danh mục
  const categoryProductCounts = React.useMemo(() => {
    if (!allProducts) return {};

    return allProducts.reduce((acc: { [key: string]: number }, product) => {
      const categoryId = product.category?._id;
      if (categoryId) {
        acc[categoryId] = (acc[categoryId] || 0) + 1;
      }
      return acc;
    }, {});
  }, [allProducts]);

  // Xử lý khi click vào danh mục
  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category._id}`);
  };

  useLayoutEffect(() => {
    if (
      isLoadingHomePage ||
      !featuresContainerRef.current ||
      !homePageData?.features ||
      homePageData.features.length === 0
    ) {
      return;
    }

    const featureItems = Array.from(
      featuresContainerRef.current.children
    ) as HTMLElement[];

    if (featureItems.length === 0) return;

    const DURATION = 0.3;
    const EXPAND_FLEX_GROW = 2;
    const NORMAL_FLEX_GROW = 1;
    const SHRINK_FLEX_GROW = 0.5;

    featureItems.forEach((item) => {
      const descriptionElement = item.querySelector(".feature-description");
      const buttonElement = item.querySelector(".feature-button");

      // Initially hide description and button
      if (descriptionElement && buttonElement) {
        gsap.set([descriptionElement, buttonElement], {
          opacity: 0,
          y: 20,
          display: "none",
        });
      }

      // Set initial state
      gsap.set(item, {
        flexGrow: NORMAL_FLEX_GROW,
        width: `${100 / featureItems.length}%`,
      });

      item.addEventListener("mouseenter", () => {
        // Expand hovered item
        gsap.to(item, {
          flexGrow: EXPAND_FLEX_GROW,
          duration: DURATION,
          ease: "power2.inOut",
        });

        // Show description and button
        if (descriptionElement && buttonElement) {
          gsap.to([descriptionElement, buttonElement], {
            opacity: 1,
            y: 0,
            display: "block",
            duration: DURATION,
            stagger: 0.1,
            ease: "power2.out",
          });
        }

        // Shrink other items
        featureItems.forEach((otherItem) => {
          if (otherItem !== item) {
            gsap.to(otherItem, {
              flexGrow: SHRINK_FLEX_GROW,
              duration: DURATION,
              ease: "power2.inOut",
            });
          }
        });
      });

      item.addEventListener("mouseleave", () => {
        // Reset hovered item
        gsap.to(item, {
          flexGrow: NORMAL_FLEX_GROW,
          duration: DURATION,
          ease: "power2.inOut",
        });

        // Hide description and button
        if (descriptionElement && buttonElement) {
          gsap.to([descriptionElement, buttonElement], {
            opacity: 0,
            y: 20,
            display: "none",
            duration: DURATION,
            ease: "power2.in",
          });
        }

        // Reset other items
        featureItems.forEach((otherItem) => {
          if (otherItem !== item) {
            gsap.to(otherItem, {
              flexGrow: NORMAL_FLEX_GROW,
              duration: DURATION,
              ease: "power2.inOut",
            });
          }
        });
      });
    });

    return () => {
      featureItems.forEach((item) => {
        item.removeEventListener("mouseenter", () => {});
        item.removeEventListener("mouseleave", () => {});
      });
    };
  }, [isLoadingHomePage, homePageData?.features]);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const shouldUseRecommendations =
    !!userId && isSuccessRecommendations && !isErrorRecommendations;
  const shouldUseFallback = enableFallback && isSuccessFallback;

  const productsToShowSource: Product[] | undefined = shouldUseRecommendations
    ? recommendedProducts
    : shouldUseFallback
    ? fallbackProducts
    : undefined;

  let isLoadingProducts = isLoadingHomePage;
  if (userId) {
    isLoadingProducts = isLoadingProducts || isLoadingRecommendations;
  }
  if (enableFallback) {
    isLoadingProducts = isLoadingProducts || isLoadingFallback;
  }

  const renderSkeletonCard = (key: number) => (
    <div key={key} className="space-y-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );

  return (
    <div className="space-y-10 md:space-y-16 pb-16">
      <section className="relative -mt-px">
        {isLoadingHomePage || isLoadingFeatured ? (
          <Skeleton className="w-full h-[35vh] md:h-[55vh] lg:h-[70vh]" />
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="relative">
            <Carousel
              opts={{ loop: true, align: "start" }}
              className="w-full overflow-hidden"
              setApi={setApi}
            >
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem key={product._id}>
                    <div className="relative w-full h-[35vh] md:h-[55vh] lg:h-[70vh] bg-cover bg-center flex items-center">
                      <img
                        src={product.images[0] || "/images/default-banner.jpg"}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover -z-10"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
                      <div className="relative z-10 text-left max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 w-full">
                        <div className="max-w-lg md:max-w-xl">
                          <div className="mb-3 inline-block px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">
                            Sản phẩm nổi bật #
                            {featuredProducts.indexOf(product) + 1}
                          </div>
                          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 drop-shadow-lg leading-tight">
                            {product.name}
                          </h1>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-white/90 text-lg md:text-xl lg:text-2xl font-semibold">
                              {formatCurrency(product.base_price)}
                            </span>
                            {product.averageRating && (
                              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-sm flex items-center gap-1">
                                <span>⭐</span>
                                <span>{product.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-white/90 text-sm md:text-base lg:text-lg mb-5 md:mb-7 drop-shadow line-clamp-2">
                            {product.description?.[0]}
                          </p>
                          <Button
                            size="lg"
                            className="bg-white text-black hover:bg-gray-200"
                            asChild
                          >
                            <Link to={`/product/${product._id}`}>
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {featuredProducts.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 hidden md:inline-flex bg-white/70 hover:bg-white text-black" />
                  <CarouselNext className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 hidden md:inline-flex bg-white/70 hover:bg-white text-black" />
                </>
              )}
            </Carousel>
            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-[35vh] md:h-[55vh] lg:h-[70vh] bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Không có sản phẩm nổi bật.</p>
          </div>
        )}
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8">
            Danh Mục Sản Phẩm
          </h2>
          {isLoadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-lg" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <CategoryShowcase
              categories={categories}
              onCategoryClick={handleCategoryClick}
              categoryProductCounts={categoryProductCounts}
            />
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Không có danh mục nào.</p>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8">
          {shouldUseRecommendations ? "Dành cho bạn" : "Hàng Mới Về"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoadingProducts ? (
            Array.from({ length: MAX_PRODUCTS_TO_SHOW }).map((_, i) =>
              renderSkeletonCard(i)
            )
          ) : productsToShowSource && productsToShowSource.length > 0 ? (
            productsToShowSource
              .slice(0, MAX_PRODUCTS_TO_SHOW)
              .map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-8">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          )}
        </div>
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

      {!isLoadingHomePage &&
        homePageData?.features &&
        homePageData.features.length > 0 && (
          <section className="container mx-auto px-4 overflow-hidden">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8">
              Ưu đãi Đặc biệt
            </h2>
            <ExpandableSection
              items={homePageData.features.map((feature) => ({
                id: feature._id,
                title: feature.title || "Ưu đãi đặc biệt",
                description: feature.description,
                imageUrl:
                  feature.image_url ||
                  feature.photo_url ||
                  "/images/feature-placeholder.png",
                link: "#",
              }))}
            />
          </section>
        )}

      <section className="bg-gray-50 py-10 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-8 md:mb-10">
            Tại sao chọn Chúng tôi?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5H9.75m0-4.5H3.375M9.75 14.25H14.25m5.25 0H9.75M14.25 14.25h4.875c.621 0 1.125.504 1.125 1.125V18.75M14.25 14.25V9.75c0-.621-.504-1.125-1.125-1.125H5.625c-.621 0-1.125.504-1.125 1.125v4.5"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
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
