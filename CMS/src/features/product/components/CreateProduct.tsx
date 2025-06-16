import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Loader, Trash2 } from "lucide-react";
import { useCreateProductMutation } from "@/services/product/createProductMutation";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductInput, VariantInput } from "@/types/dataTypes";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useGetAllCategoriesQuery();
  const createProduct = useCreateProductMutation();

  const [formData, setFormData] = useState<ProductInput>({
    name: "",
    base_price: 0,
    description: [],
    category: "",
    brand: "",
    tags: [],
    images: [],
    variants: [],
  });

  const [variant, setVariant] = useState<VariantInput>({
    types: "",
    price: 0,
    stock: 0,
  });

  const [descriptionInput, setDescriptionInput] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        [name]: value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }));
    } else if (name === "base_price" || name === "price") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVariant((prev) => ({
      ...prev,
      [name]: name === "types" ? value : Number(value),
    }));
  };

  const handleAddVariant = () => {
    if (variant.types && variant.price > 0 && variant.stock >= 0) {
      setFormData((prev) => ({
        ...prev,
        variants: [...(prev.variants || []), variant],
      }));
      setVariant({ types: "", price: 0, stock: 0 });
    } else {
      toast.error("Vui lòng điền đầy đủ thông tin biến thể");
    }
  };

  const handleAddDescription = () => {
    if (descriptionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        description: [...(prev.description || []), descriptionInput.trim()],
      }));
      setDescriptionInput("");
    }
  };

  const handleRemoveDescription = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log("formData", formData);
    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast.error("Tên sản phẩm không được để trống");
        setLoading(false);
        return;
      }
      if (!formData.base_price || formData.base_price <= 0) {
        toast.error("Giá cơ bản phải lớn hơn 0");
        setLoading(false);
        return;
      }
      if (!formData.category) {
        toast.error("Vui lòng chọn danh mục");
        setLoading(false);
        return;
      }
      if (!formData.brand) {
        toast.error("Vui lòng nhập thương hiệu");
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        base_price: formData.base_price,
        description: formData.description || [],
        category: formData.category,
        brand: formData.brand,
        tags: formData.tags || [],
        variants: formData.variants || [],
      };

      console.log("Data to be sent:", submitData);

      // Submit data directly
      const response = await createProduct.mutateAsync(submitData);
      console.log("Server response:", response);

      toast.success("Tạo sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      toast.error("Lỗi khi tạo sản phẩm");
      console.error("Create product error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                  placeholder="VD: Admin Panel Laptop Test"
                />
              </div>

              {/* Base Price Input */}
              <div>
                <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                  Giá cơ bản
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40 pr-16"
                    placeholder="25000000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-sm text-muted-foreground/70 dark:text-muted-foreground/60 border-l border-input/20 dark:border-input/10">
                    VNĐ
                  </div>
                </div>
              </div>

              {/* Brand Input */}
              <div>
                <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                  Thương hiệu
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                  placeholder="VD: DELL"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                  Danh mục
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Input */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                  Mô tả
                </label>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      className="flex-1 rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                      placeholder="VD: Created via admin panel., Test specifications."
                    />
                    <Button
                      type="button"
                      onClick={handleAddDescription}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm mô tả
                    </Button>
                  </div>

                  {/* Description List */}
                  {formData.description && formData.description.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.description.map((desc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-md bg-muted/30 dark:bg-muted/20"
                        >
                          <span>{desc}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveDescription(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags Input */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags?.join(", ")}
                  onChange={handleChange}
                  className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                  placeholder="VD: admin-test, 15inch (phân cách bằng dấu phẩy)"
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Biến thể sản phẩm</h3>
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm biến thể
                </Button>
              </div>

              {/* Variant Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Cấu hình
                  </label>
                  <input
                    type="text"
                    name="types"
                    value={variant.types}
                    onChange={handleVariantChange}
                    className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                    placeholder="VD: i5 / 16GB / 512GB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Giá
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={variant.price}
                      onChange={handleVariantChange}
                      className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40 pr-16"
                      placeholder="25000000"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-sm text-muted-foreground/70 dark:text-muted-foreground/60 border-l border-input/20 dark:border-input/10">
                      VNĐ
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={variant.stock}
                    onChange={handleVariantChange}
                    min="0"
                    className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Variants List */}
              {formData.variants && formData.variants.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.variants.map((v, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/30 dark:bg-muted/20"
                    >
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <span>{v.types}</span>
                        <span>{v.price.toLocaleString("vi-VN")} VNĐ</span>
                        <span>{v.stock} cái</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            variants: prev.variants?.filter(
                              (_, i) => i !== index
                            ),
                          }));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                Tạo sản phẩm
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProduct;
