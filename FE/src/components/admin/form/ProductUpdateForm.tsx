import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { ProductData } from "@/types/dataTypes";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProductUpdateFormProps {
  product: ProductData;
}

const ProductUpdateForm = ({ product }: ProductUpdateFormProps) => {
  const [formData, setFormData] = useState<ProductData>({ ...product });
  const [newImageUrl, setNewImageUrl] = useState(""); // New state for image URL input
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { data: categories = [], isLoading } = useGetAllCategoriesQuery();
  // const {} =
  // Update form state when product prop changes
  useEffect(() => {
    setFormData({ ...product });
  }, [product]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    // Your submit logic here
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCategoryName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category: { ...prev.category, name: newCategoryName },
    }));
  };

  // Handler to add a new image URL to the product
  const handleAddImage = () => {
    if (newImageUrl.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl(""); // Clear the input after adding
    }
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
              value={formData.price}
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
              value={formData.category.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alternative using datalist (optional) */}
          {/*
          <div>
            <label className="block text-sm font-medium">Category:</label>
            <input
              list="categoryOptions"
              name="categoryName"
              value={
                typeof formData.category === "object"
                  ? formData.category.name
                  : formData.category
              }
              onChange={handleCategoryChange}
              className="w-full border p-2 rounded"
              placeholder="Enter or select category"
            />
            <datalist id="categoryOptions">
              {categories.map((c) => (
                <option key={c._id} value={c.name}></option>
              ))}
            </datalist>
          </div>
          */}

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

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium">
              Short Description:
            </label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter short description"
            />
          </div>

          {/* More Information */}
          <div>
            <label className="block text-sm font-medium">
              More Information:
            </label>
            <input
              type="text"
              name="moreInfomation"
              value={formData.moreInfomation}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Enter more information"
            />
          </div>

          {/* Existing Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images:</label>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((i, index) => (
                <img
                  key={index}
                  src={i}
                  alt={`${formData.name} image ${index + 1}`}
                  className="w-20 h-20 object-cover border rounded"
                />
              ))}
            </div>
          </div>

          {/* New Image URL Input */}
          <div className="mt-4">
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/products")}
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
