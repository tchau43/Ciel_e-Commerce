import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { useUpdateProductMutation } from "@/services/product/updateProductMutation";
import { useDeleteProductMutation } from "@/services/product/deleteProductMutation";
import { useAddVariantMutation } from "@/services/product/addVariantMutation";
import { useDeleteVariantMutation } from "@/services/product/deleteVariantMutation";
import { useUpdateVariantMutation } from "@/services/product/updateVariantMutation";
import { Product, VariantInput, BrandReference } from "@/types/dataTypes";
import { Loader, Eye, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import VariantList from "./VariantList";

interface ProductUpdateFormProps {
  product: Product;
}

interface UpdateProductData {
  name?: string;
  base_price?: number;
  description?: string[];
  category?: string;
  brand?: string;
  tags?: string[];
  images?: string[];
  url?: string;
  popularity?: number;
}


type FormDataType = Required<
  Pick<
    Product,
    | "_id"
    | "name"
    | "base_price"
    | "category"
    | "images"
    | "variants"
    | "createdAt"
    | "updatedAt"
  >
> & {
  description: string[]; 
  brand?: BrandReference; 
  tags: string[]; 
  averageRating?: number; 
  numberOfReviews?: number; 
};

const ProductUpdateForm = ({ product }: ProductUpdateFormProps) => {
  
  const ensureDescriptionArray = (desc: string[] | undefined): string[] => {
    if (!desc) return [];
    if (!Array.isArray(desc)) return [];
    return desc;
  };

  
  const [formData, setFormData] = useState<FormDataType>(() => {
    const description = ensureDescriptionArray(product.description);
    const tags = product.tags ?? [];

    const initialData = {
      _id: product._id,
      name: product.name,
      base_price: product.base_price,
      category: product.category,
      images: product.images,
      variants: product.variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      description,
      brand: product.brand,
      tags,
      averageRating: product.averageRating,
      numberOfReviews: product.numberOfReviews,
    };

    return {
      ...initialData,
      description: description as string[],
      tags: tags as string[],
    } as FormDataType & {
      description: string[];
      tags: string[];
    } as unknown as FormDataType & {
      description: string[];
      tags: string[];
    } as FormDataType & {
      description: string[];
      tags: string[];
    } as FormDataType & {
      description: string[];
      tags: string[];
    } as FormDataType;
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);

  const { data: categories = [] } = useGetAllCategoriesQuery();
  const updateProduct = useUpdateProductMutation();
  const deleteProduct = useDeleteProductMutation();
  const addVariant = useAddVariantMutation();
  const deleteVariant = useDeleteVariantMutation();
  const updateVariant = useUpdateVariantMutation();

  const imageSources = product.images?.length
    ? product.images
    : Array(4).fill("/logo.png");

  const displayedImages = showAllImages
    ? imageSources
    : imageSources.slice(0, 4);
  const hasMoreImages = imageSources.length > 4;
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...product,
      description: product.description || [],
      tags: product.tags || [],
    }));
  }, [product]);

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
    const selectedCategory = categories.find((c) => c._id === e.target.value);
    if (selectedCategory) {
      setFormData((prev) => ({
        ...prev,
        category: selectedCategory,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct.mutateAsync({ productId: product._id });
      toast.success("Xóa sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await deleteVariant.mutateAsync({ variantId });
      queryClient.invalidateQueries({ queryKey: ["product", product._id] });
      toast.success("Xóa biến thể thành công");
    } catch (error) {
      toast.error("Lỗi khi xóa biến thể");
    }
  };

  const handleAddVariant = async (variantData: VariantInput) => {
    try {
      await addVariant.mutateAsync({
        productId: product._id,
        variables: variantData,
      });
      queryClient.invalidateQueries({ queryKey: ["product", product._id] });
      toast.success("Thêm biến thể thành công");
    } catch (error) {
      toast.error("Lỗi khi thêm biến thể");
    }
  };

  const handleUpdateVariant = async (
    variantId: string,
    variantData: VariantInput
  ) => {
    try {
      await updateVariant.mutateAsync({
        variantId,
        variables: variantData,
      });
      queryClient.invalidateQueries({ queryKey: ["product", product._id] });
      toast.success("Cập nhật biến thể thành công");
    } catch (error) {
      toast.error("Lỗi khi cập nhật biến thể");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      const updateData: UpdateProductData = {};

      
      if (formData.name !== product.name) {
        updateData.name = formData.name;
      }

      if (formData.base_price !== product.base_price) {
        updateData.base_price = Number(formData.base_price);
      }

      
      const currentDesc = formData.description.filter(
        (desc) => desc.trim() !== ""
      );
      const originalDesc = product.description || [];
      if (JSON.stringify(currentDesc) !== JSON.stringify(originalDesc)) {
        updateData.description = currentDesc;
      }

      
      if (formData.category?._id !== product.category._id) {
        updateData.category = formData.category._id;
      }

      
      if (formData.brand?._id !== product.brand?._id) {
        updateData.brand = formData.brand?._id;
      }

      
      if (JSON.stringify(formData.tags) !== JSON.stringify(product.tags)) {
        updateData.tags = formData.tags;
      }

      
      if (selectedFile) {
        
        
        
      }

      
      console.log("Update data:", updateData);

      const result = await updateProduct.mutateAsync({
        productId: product._id,
        variables: updateData,
      });

      if (result) {
        queryClient.invalidateQueries({ queryKey: ["product", product._id] });
        toast.success("Cập nhật sản phẩm thành công");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi cập nhật sản phẩm"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-foreground/90 dark:text-foreground/80">
                  Thông tin sản phẩm
                </h3>
                <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
                  Cập nhật thông tin cơ bản của sản phẩm
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name ?? ""}
                    onChange={handleChange}
                    className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Giá cơ bản
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.base_price}
                    onChange={handleChange}
                    className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                    placeholder="Nhập giá cơ bản của sản phẩm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category._id}
                    onChange={handleCategoryChange}
                    className="w-full rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground/90 dark:text-foreground/80 mb-1.5">
                    Mô tả
                  </label>
                  <div className="space-y-2">
                    {formData.description.map((desc, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={desc}
                          onChange={(e) => {
                            const newDesc = [...formData.description];
                            newDesc[index] = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              description: newDesc,
                            }));
                          }}
                          className="flex-1 rounded-md bg-input/90 dark:bg-input/80 border border-input/20 dark:border-input/10 p-2.5 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40 focus:border-primary/50 dark:focus:border-primary/40 focus:ring-1 focus:ring-primary/50 dark:focus:ring-primary/40"
                          placeholder={`Mô tả ${index + 1}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="border-border/20 dark:border-border/10 hover:bg-destructive/20 dark:hover:bg-destructive/10 text-destructive-foreground/90 dark:text-destructive-foreground/80"
                          onClick={() => {
                            const newDesc = formData.description.filter(
                              (_, i) => i !== index
                            );
                            setFormData((prev) => ({
                              ...prev,
                              description: newDesc,
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          description: [...prev.description, ""],
                        }));
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm mô tả
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteProduct}
                  className="border-border/20 dark:border-border/10 hover:bg-destructive/20 dark:hover:bg-destructive/10 text-destructive-foreground/90 dark:text-destructive-foreground/80"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa sản phẩm
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary/90 dark:bg-primary/80 hover:bg-primary/100 dark:hover:bg-primary/90"
                >
                  {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Cập nhật
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90">
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground/90 dark:text-foreground/80">
                Hình ảnh sản phẩm
              </h3>
              <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
                Quản lý hình ảnh của sản phẩm
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayedImages.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted/30 dark:bg-muted/20 ring-1 ring-border/10 dark:ring-border/20"
                >
                  <img
                    src={src}
                    alt={`Product ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>

            {hasMoreImages && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAllImages(!showAllImages)}
                className="border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showAllImages ? "Ẩn bớt" : "Xem thêm"}
              </Button>
            )}

            <div className="mt-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm hình ảnh
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90">
        <div className="p-6">
          <VariantList
            variants={product.variants || []}
            onDelete={handleDeleteVariant}
            onEdit={handleUpdateVariant}
            onAdd={handleAddVariant}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProductUpdateForm;
