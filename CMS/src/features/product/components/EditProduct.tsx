import { useParams } from "react-router-dom";
import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { useQueryClient } from "@tanstack/react-query";
import ProductUpdateForm from "./ProductUpdateForm";
import { Loader2 } from "lucide-react";

const EditProduct: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const {
    data: product,
    error,
    isLoading,
  } = useGetProductByIdQuery(id!, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  if (isLoading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/80 dark:text-primary/70" />
        <p className="mt-4 text-lg text-muted-foreground/70 dark:text-muted-foreground/60">
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );

  if (error) {
    console.error("Error fetching product:", error);
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30">
          <p className="text-lg font-medium text-destructive-foreground/90 dark:text-destructive-foreground/80 mb-2">
            Lỗi tải thông tin sản phẩm
          </p>
          <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
            Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi vẫn tiếp tục.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/10 dark:border-border/20">
          <p className="text-lg font-medium text-foreground/90 dark:text-foreground/80 mb-2">
            Không tìm thấy sản phẩm
          </p>
          <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
            Sản phẩm không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50 dark:bg-background/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground/90 dark:text-foreground/80">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="mt-1 text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
              Cập nhật thông tin chi tiết và biến thể của sản phẩm
            </p>
          </div>

          <div className="space-y-6">
            <ProductUpdateForm product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
