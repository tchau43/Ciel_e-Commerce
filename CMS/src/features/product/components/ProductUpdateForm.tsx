import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useUpdateProductMutation } from "@/services/product/updateProductMutation";
import { Product } from "@/types/dataTypes";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface ProductUpdateFormProps {
  product: Product;
}

const ProductUpdateForm = ({ product }: ProductUpdateFormProps) => {
  const [formData, setFormData] = useState<Product>({ ...product });
  // console.log(">>>>>>>>formData", formData);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For local file
  const [imagePreviewUrl, setImagePreviewUrl] = useState(""); // Preview for local file
  const { data: categories = [] } = useGetAllCategoriesQuery();
  useEffect(() => {
    setFormData({ ...product });
  }, [product]);
  const { mutate: productUpdate } = useUpdateProductMutation();

  // const imageSources = product?.images
  //   ? Array.from({ length: 4 }, (_, index) => {
  //       return product.images[index]
  //         ? `${VITE_BACKEND_URL}/${product.images[index]}`
  //         : "/logo.png";
  //     })
  //   : Array(4).fill("/logo.png");

  const imageSources = product?.images
    ? product.images.map((img) =>
        img.startsWith("http") ? img : `${VITE_BACKEND_URL}/${img}`
      )
    : Array(4).fill("/logo.png");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formDataToSend = new FormData();

    // Append all text fields
    formDataToSend.append("name", formData.name);
    formDataToSend.append("price", formData.base_price.toString());
    formDataToSend.append("description", formData.description?.join(",") || "");
    formDataToSend.append("category", formData.category._id);

    // Append the image file
    if (selectedFile instanceof File) {
      formDataToSend.append("image", selectedFile); // Field name must match Multer's
    }

    productUpdate(
      { productId: formData._id, variables: formDataToSend },
      {
        onSuccess: () => {
          setMessage("Cập nhật sản phẩm thành công!");
          setTimeout(() => navigate("/products"), 1000);
        },
        onError: (error) => {
          setMessage(error.message || "Error updating product");
          setLoading(false);
        },
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = e.target.value;
    const selectedCategory = categories.find(
      (c) => c._id === selectedCategoryId
    );

    if (!selectedCategory) return;

    setFormData((prev) => ({
      ...prev,
      category: { ...selectedCategory },
    }));
  };

  return (
    <div>
      <Card className="p-6 max-w-lg mx-auto mt-10 border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-4 text-foreground/90 dark:text-foreground/80">
          Cập nhật Sản phẩm
        </h2>

        {message && (
          <div
            className={`p-2 rounded-md mb-4 ${
              message.includes("Error")
                ? "bg-destructive/20 text-destructive-foreground dark:bg-destructive/30"
                : "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-400"
            }`}
          >
            {message.includes("Error")
              ? "Có lỗi xảy ra khi cập nhật sản phẩm"
              : "Cập nhật sản phẩm thành công!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80">
              Tên sản phẩm:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name ?? ""}
              onChange={handleChange}
              className="w-full border border-input/20 dark:border-input/10 bg-input/90 dark:bg-input/80 p-2 rounded text-foreground/90 dark:text-foreground/80"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80">
              Giá:
            </label>
            <input
              type="number"
              name="price"
              value={formData.base_price}
              onChange={handleChange}
              className="w-full border border-input/20 dark:border-input/10 bg-input/90 dark:bg-input/80 p-2 rounded text-foreground/90 dark:text-foreground/80"
              placeholder="Nhập giá sản phẩm"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80">
              Danh mục:
            </label>
            <select
              name="category"
              value={formData.category._id}
              onChange={handleCategoryChange}
              className="w-full border border-input/20 dark:border-input/10 bg-input/90 dark:bg-input/80 px-2 py-2 rounded text-foreground/90 dark:text-foreground/80"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80">
              Mô tả:
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-input/20 dark:border-input/10 bg-input/90 dark:bg-input/80 p-2 rounded text-foreground/90 dark:text-foreground/80"
              placeholder="Nhập mô tả sản phẩm"
            />
          </div>

          {/* Existing Images */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/90 dark:text-foreground/80">
              Hình ảnh hiện tại:
            </label>
            <div className="flex flex-wrap gap-2">
              {imageSources.map((i) => (
                <img
                  className="w-20 h-20 object-cover border border-border/10 dark:border-border/20 rounded"
                  alt="Hình ảnh sản phẩm"
                  src={i}
                />
              ))}
            </div>
          </div>

          {/* Upload New Image */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80">
              Tải lên hình ảnh mới:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-input/20 dark:border-input/10 bg-input/90 dark:bg-input/80 p-2 rounded text-foreground/90 dark:text-foreground/80"
              />
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Xem trước"
                  className="w-20 h-20 object-cover border border-border/10 dark:border-border/20 rounded"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
              disabled={loading}
              className="border-border/20 dark:border-border/10 hover:bg-muted/80 dark:hover:bg-muted/20"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary/90 dark:bg-primary/80 hover:bg-primary/100 dark:hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductUpdateForm;
