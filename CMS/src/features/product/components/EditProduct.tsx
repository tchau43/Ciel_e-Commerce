import { useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import ProductUpdateForm from "./ProductUpdateForm";

const EditProduct: React.FC = () => {
  const { id } = useParams(); // Get user ID from URL
  console.log("id", id);
  const { data: product, error, isLoading } = useGetProductByIdQuery(id!);
  //   console.log("data", user);
  if (isLoading)
    return (
      <p className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
        Đang tải thông tin sản phẩm...
      </p>
    );

  if (error) {
    console.error("Error fetching product:", error);
    return (
      <p className="text-center text-destructive/90 dark:text-destructive/80">
        Lỗi tải thông tin sản phẩm. Vui lòng thử lại.
      </p>
    );
  }

  if (!product) {
    return (
      <p className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
        Không tìm thấy sản phẩm.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 dark:bg-background/30 py-8">
      <ProductUpdateForm product={product!} />
    </div>
  );
};

export default EditProduct;
