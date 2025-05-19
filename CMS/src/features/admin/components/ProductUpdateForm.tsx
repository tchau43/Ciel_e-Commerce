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
  const { data: categories = [], isLoading } = useGetAllCategoriesQuery();
  useEffect(() => {
    setFormData({ ...product });
  }, [product]);
  const {
    mutate: productUpdate,
    isError,
    isPending,
  } = useUpdateProductMutation();

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
          setMessage("Product updated successfully!");
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
      <Card className="p-6 max-w-lg mx-auto mt-10 border rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Update Product</h2>

        {message && (
          <div
            className={`p-2 rounded-md mb-4 text-white ${
              message.includes("Error") ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name ?? ""}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter name"
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium">Price:</label>
            <input
              type="number"
              name="price"
              value={formData.base_price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter price"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium">Category:</label>
            <select
              name="category"
              value={formData.category._id} // Use _id instead of name
              onChange={handleCategoryChange}
              className="border rounded-md w-full px-1 py-2"
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
            <label className="block text-sm font-medium">Description:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter description"
            />
          </div>

          {/* Existing Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images:</label>
            <div className="flex flex-wrap gap-2">
              {imageSources.map((i) => (
                <img
                  className="w-20 h-20 object-cover border rounded"
                  alt=""
                  src={i}
                />
              ))}
            </div>
          </div>

          {/* New Image URL Input */}
          {/* <div className="mt-4">
            <label className="block text-sm font-medium">
              Add New Image URL:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="w-full border p-2 rounded"
              />
              <Button type="button" onClick={handleAddImage}>
                Add Image
              </Button>
            </div>
          </div> */}

          <div className="mt-4">
            <label className="block text-sm font-medium">
              Upload New Image:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover border rounded"
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/products")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductUpdateForm;
