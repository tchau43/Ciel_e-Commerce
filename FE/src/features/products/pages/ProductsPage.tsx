import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CategoriesList from "@/features/category/components/CategoriesList";
import ProductsList from "@/features/products/components/ProductsList";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductBySearchQuery } from "@/services/product/getProductBySearchQuery";
import { Product, Category } from "@/types/dataTypes";
import { cn } from "@/lib/utils";
import ProductCard from "@/features/components/ProductCard";

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

const ProductsPage = () => {
  const location = useLocation();
  const [queryParams, setQueryParams] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQueryParams(params.toString());
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
  } = useGetProductBySearchQuery(queryParams);

  if (categoriesLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-ch-red-10/80 to-ch-red-10">
        <p className="text-center text-gray-600 p-10">Đang tải bộ lọc...</p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-ch-red-10/80 to-ch-red-10">
        <p className="text-center text-ch-red p-10">Lỗi khi tải bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-ch-red-10/80 to-ch-red-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Button for Mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-30 p-4 bg-gradient-to-r from-ch-blue to-ch-blue-600 text-white rounded-full shadow-lg hover:shadow-ch-blue/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue transition-all duration-500 hover:scale-110 animate-pulse"
            aria-label="Mở bộ lọc"
          >
            <FilterIcon className="w-6 h-6" />
          </button>

          {/* Overlay for Mobile Sidebar */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-md transition-all duration-500"
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "backdrop-blur-xl bg-white/80 rounded-2xl",
              "fixed inset-y-0 left-0 w-72 sm:w-80 transform transition-all duration-500 ease-out z-20",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "md:static md:translate-x-0 md:w-80 md:flex-shrink-0 md:block",
              "border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]",
              "hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.57)] transition-all duration-500"
            )}
          >
            <div className="sticky top-20 p-8">
              <div className="flex items-center space-x-3 mb-8 group">
                <div className="p-3 rounded-xl bg-gradient-to-br from-ch-blue to-ch-blue-600 shadow-lg transform transition-all duration-300 group-hover:scale-110">
                  <FilterIcon className="w-6 h-6 text-white transform transition-transform duration-300 group-hover:rotate-180" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-ch-blue via-ch-blue-600 to-ch-blue bg-size-200 bg-pos-0 hover:bg-pos-100 bg-clip-text text-transparent transition-all duration-500">
                  Danh mục sản phẩm
                </h3>
              </div>

              <div className="relative group">
                {/* Animated border gradient */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-ch-blue via-ch-blue-600 to-ch-blue rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-300 animate-gradient-xy"></div>

                {/* Glass container */}
                <div className="relative backdrop-blur-xl bg-white/80 rounded-xl p-6 ring-1 ring-white/50 shadow-lg">
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-50"></div>

                  {/* Content */}
                  <div className="relative">
                    <CategoriesList
                      data={categoriesData}
                      queryParams={queryParams}
                      setQueryParams={setQueryParams}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="backdrop-blur-xl bg-white/90 p-3 sm:p-4 md:p-6 lg:p-8 rounded-2xl shadow-lg border border-white/20">
              {productsLoading && (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[280px] bg-gradient-to-br from-gray-100/50 to-gray-200/50 rounded-xl animate-pulse backdrop-blur-xl"
                    />
                  ))}
                </div>
              )}

              {productsError && !productsLoading && (
                <div className="text-center py-10">
                  <p className="text-ch-red text-lg font-medium">
                    Không thể tải sản phẩm. Vui lòng thử lại sau.
                  </p>
                </div>
              )}

              {!productsLoading && !productsError && (
                <>
                  {products && products.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                        {products.map((p) => (
                          <div
                            key={p._id}
                            className="w-full flex justify-center"
                          >
                            <ProductCard product={p} />
                          </div>
                        ))}
                      </div>

                      {/* Pagination section if needed */}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 text-lg font-medium">
                        Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.
                      </p>
                      <p className="text-gray-400 mt-2">
                        Vui lòng thử với bộ lọc khác.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
