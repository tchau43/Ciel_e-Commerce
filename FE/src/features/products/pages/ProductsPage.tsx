import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Pagination } from "antd";
import CategoriesList from "@/features/category/components/CategoriesList";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        // 2xl
        setItemsPerPage(15);
      } else if (width >= 1280) {
        // xl
        setItemsPerPage(10);
      } else if (width >= 1024) {
        // lg
        setItemsPerPage(8);
      } else if (width >= 768) {
        // md
        setItemsPerPage(6);
      } else if (width >= 640) {
        // sm
        setItemsPerPage(4);
      } else {
        // xs
        setItemsPerPage(4);
      }
    };

    const debouncedHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateItemsPerPage, 200);
    };

    let timeoutId: NodeJS.Timeout;
    updateItemsPerPage();
    window.addEventListener("resize", debouncedHandler);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedHandler);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQueryParams(params.toString());
    setCurrentPage(1); // Reset page when filters change
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

  // Pagination calculations
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (_: number, size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-ch-pink-10/80 to-ch-pink-10">
        <p className="text-center text-gray-600 p-10">Đang tải bộ lọc...</p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-ch-pink-10/80 to-ch-pink-10">
        <p className="text-center text-ch-pink p-10">Lỗi khi tải bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="">
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

          {/* Main Content */}
          <main className="flex-1">
            {/* Categories Horizontal Bar */}
            <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-ch-blue/10 px-2 py-3 mb-6 w-full">
              <div className="max-w-full overflow-x-auto">
                <div className="flex items-center gap-2 sm:gap-4">
                  <FilterIcon className="w-5 h-5 text-ch-blue flex-shrink-0" />
                  <CategoriesList
                    data={categoriesData}
                    queryParams={queryParams}
                    setQueryParams={setQueryParams}
                  />
                </div>
              </div>
            </div>
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
                  <p className="text-ch-pink text-lg font-medium">
                    Không thể tải sản phẩm. Vui lòng thử lại sau.
                  </p>
                </div>
              )}

              {!productsLoading && !productsError && (
                <>
                  {products && products.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                        {paginatedProducts.map((p) => (
                          <div
                            key={p._id}
                            className="w-full flex justify-center"
                          >
                            <ProductCard product={p} />
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                          <Pagination
                            current={currentPage}
                            pageSize={itemsPerPage}
                            total={products.length}
                            onChange={handlePageChange}
                            onShowSizeChange={handlePageSizeChange}
                            showSizeChanger
                            pageSizeOptions={[4, 6, 8, 10, 15, 20]}
                            showQuickJumper
                          />
                        </div>
                      )}
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
