import { ProductData } from "@/types/dataTypes";
import ProductIntro from "./ProductIntro";
import { useEffect, useState } from "react";
import { Pagination } from "antd";

interface ProductsListProps {
  data: ProductData[];
}

const ProductsList = ({ data }: ProductsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      let newSize = 9;
      if (width >= 1536) {
        newSize = 10;
      } else if (width >= 1024) {
        newSize = 12;
      } else if (width >= 768) {
        newSize = 9;
      } else if (width >= 640) {
        newSize = 8;
      } else {
        newSize = 5;
      }
      setItemsPerPage(newSize);
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
  }, []); // Empty dependency array

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data
    ? data.slice(startIndex, startIndex + itemsPerPage)
    : [];

  const handleAntdPageChange = (page: number /*, pageSize?: number */) => {
    setCurrentPage(page);
  };

  const handleAntdSizeChange = (current: number, size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  if (!data || data.length === 0) {
    return <p className="text-center my-10">No products found.</p>;
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 lg:gap-10 mb-10">
        {paginatedData.map((p) => (
          <div className="flex justify-center" key={p._id}>
            <ProductIntro data={p} />
          </div>
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
            showSizeChanger={true}
            pageSizeOptions={[8, 9, 10, 12, 24, 36]}
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
};

export default ProductsList;
