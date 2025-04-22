// src/components/product/ProductsList.tsx (Updated)
import { ProductData } from "@/types/dataTypes";
// import ProductIntro from "./ProductIntro"; // Remove this
import ProductCard from "@/components/shared/ProductCard"; // Import ProductCard
import { useEffect, useState } from "react";
import { Pagination } from "antd"; // Keep Ant Design pagination

interface ProductsListProps {
  data: ProductData[];
}

const ProductsList = ({ data }: ProductsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // Keep your itemsPerPage logic

  // --- Keep all your useEffect hooks for itemsPerPage and resetting currentPage ---
  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      let newSize = 9;
      if (width >= 1536) {
        newSize = 20;
      } else if (width >= 1024) {
        newSize = 16;
      } else if (width >= 768) {
        newSize = 9;
      } else if (width >= 640) {
        newSize = 8;
      } else {
        newSize = 5;
      }
      // Only update if size actually changes to avoid unnecessary re-renders
      setItemsPerPage((prevSize) =>
        prevSize !== newSize ? newSize : prevSize
      );
    };

    let timeoutId: NodeJS.Timeout | null = null;
    const debouncedHandler = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateItemsPerPage();
      }, 200);
    };

    updateItemsPerPage(); // Initial call
    window.addEventListener("resize", debouncedHandler);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedHandler);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset page when data changes
  }, [data]);
  // --- End of existing useEffect hooks ---

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data
    ? data.slice(startIndex, startIndex + itemsPerPage)
    : [];

  const handleAntdPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
  };

  // --- Keep handleAntdSizeChange ---
  const handleAntdSizeChange = (current: number, size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1); // Reset to page 1 when size changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!data || data.length === 0) {
    // Use the existing "No products found" message from ProductsPage for consistency
    return null; // Let ProductsPage handle the "no products" message
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      {/* Use your existing grid classes */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 mb-10">
        {paginatedData.map((p) => (
          // Use ProductCard instead of ProductIntro
          // Removed the extra div with justify-center, ProductCard should handle its own alignment if needed
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {/* Keep your Ant Design Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={data.length}
            onChange={handleAntdPageChange}
            onShowSizeChange={handleAntdSizeChange}
            showSizeChanger={true}
            pageSizeOptions={[8, 9, 10, 12, 24, 36]} // Keep your options
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
};

export default ProductsList;
