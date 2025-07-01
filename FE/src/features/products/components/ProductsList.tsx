import { useEffect, useState } from "react";
import { Product } from "@/types/dataTypes"; 
import ProductCard from "@/features/components/ProductCard";
import { Pagination } from "antd";

interface ProductsListProps {
  data: Product[]; 
}

const ProductsList = ({ data }: ProductsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

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

    updateItemsPerPage();
    window.addEventListener("resize", debouncedHandler);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedHandler);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data
    ? data.slice(startIndex, startIndex + itemsPerPage)
    : [];

  const handleAntdPageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAntdSizeChange = (_: number, size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!data || data.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 mb-10">
        {paginatedData.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            pageSize={itemsPerPage}
            total={data.length}
            onChange={handleAntdPageChange}
            onShowSizeChange={handleAntdSizeChange}
            showSizeChanger
            pageSizeOptions={[8, 9, 10, 12, 24, 36]}
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
};

export default ProductsList;
