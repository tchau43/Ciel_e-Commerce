import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductData } from "@/types/dataTypes";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface ProductsManagementTableProps {
  data: ProductData[];
}

const ProductsManagementTable = ({ data }: ProductsManagementTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const itemsPerPage = 10;

  // Sorting logic: sort the data based on sortConfig then paginate.
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;
        // Handle nested properties if needed (e.g., category.name)
        if (sortConfig.key === "category") {
          aVal = a.category.name;
          bVal = b.category.name;
        } else {
          aVal = a[sortConfig.key as keyof ProductData];
          bVal = b[sortConfig.key as keyof ProductData];
        }
        // Basic comparison (you might need more complex logic for numbers/dates)
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    // setTimeout(() => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle sort direction if the same key is clicked
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    // Optionally, reset to first page on sort
    setCurrentPage(1);
    // }, 300);
  };

  // Apply pagination to the sorted data.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (_id: string) => {
    navigate(`/admin/editProduct/${_id}`);
  };

  return (
    <div>
      <Card>
        <CardContent className="pb-0 mr">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer"
                >
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("price")}
                  className="cursor-pointer w-[15%]"
                >
                  Price{" "}
                  {sortConfig.key === "price" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("category")}
                  className="cursor-pointer w-[15%]"
                >
                  Category{" "}
                  {sortConfig.key === "category" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("brand")}
                  className="cursor-pointer w-[15%]"
                >
                  Brand{" "}
                  {sortConfig.key === "brand" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("quantity_in_stock")}
                  className="cursor-pointer w-[12.5%]"
                >
                  Quantity In Stock{" "}
                  {sortConfig.key === "quantity_in_stock" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("status")}
                  className="cursor-pointer w-[10%]"
                >
                  Status{" "}
                  {sortConfig.key === "status" &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </TableHead>
                <TableHead className="cursor-pointer w-1/12">Edit </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.base_price}</TableCell>
                  <TableCell>{p.category.name}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>{p.quantity_in_stock}</TableCell>
                  <TableCell>{p.status ? "active" : "block"}</TableCell>
                  <TableCell>
                    <p
                      onClick={() => handleEdit(p._id)}
                      className="hover:underline cursor-pointer text-blue-600"
                    >
                      Edit
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Pagination Controls */}
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

export default ProductsManagementTable;
