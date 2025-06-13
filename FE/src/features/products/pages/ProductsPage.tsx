import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CategoriesList from "@/features/category/components/CategoriesList";
import ProductsList from "@/features/products/components/ProductsList";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useGetProductBySearchQuery } from "@/services/product/getProductBySearchQuery";
import { Product, Category } from "@/types/dataTypes";
import { cn } from "@/lib/utils";

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
      <div className="min-h-screen pt-16 bg-ch-red-10">
        <p className="text-center text-gray-600 p-10">Đang tải bộ lọc...</p>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="min-h-screen pt-16 bg-ch-red-10">
        <p className="text-center text-ch-red p-10">Lỗi khi tải bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-ch-red-10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Button for Mobile */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden fixed bottom-4 right-4 z-50 p-3 bg-ch-blue text-white rounded-full shadow-lg hover:bg-ch-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue transition-colors duration-200"
            aria-label="Mở bộ lọc"
          >
            <FilterIcon />
          </button>

          {/* Overlay for Mobile Sidebar */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "bg-white p-6 rounded-lg shadow-sm",
              "fixed inset-y-0 left-0 w-64 sm:w-72 transform transition-transform duration-300 ease-in-out z-50",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full",
              "md:static md:translate-x-0 md:w-72 md:flex-shrink-0 md:block"
            )}
          >
            <div className="sticky top-20">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Danh mục sản phẩm
              </h3>
              <CategoriesList
                data={categoriesData}
                queryParams={queryParams}
                setQueryParams={setQueryParams}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {productsLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[400px] bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              )}

              {productsError && !productsLoading && (
                <div className="text-center py-10">
                  <p className="text-ch-red text-lg">
                    Không thể tải sản phẩm. Vui lòng thử lại sau.
                  </p>
                </div>
              )}

              {!productsLoading && !productsError && (
                <>
                  {products && products.length > 0 ? (
                    <ProductsList data={products} />
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 text-lg">
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
