import { ProductData } from "@/types/dataTypes";
// import Product from "./Product";
import ProductIntro from "./ProductIntro";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ProductsListProps {
  data: ProductData[];
}

const ProductsList = ({ data }: ProductsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1536) {
        // 2xl
        setItemsPerPage(12);
      } else {
        setItemsPerPage(9);
      }
    };
    updateItemsPerPage();
    // Add event listener for window resizing
    window.addEventListener("resize", updateItemsPerPage);
    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 space-y-10">
        {paginatedData.map((p) => (
          <div className="flex justify-center" key={p._id}>
            <ProductIntro data={p} />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-2">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ProductsList;
