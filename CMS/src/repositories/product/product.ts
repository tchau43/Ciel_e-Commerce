// src/repositories/product/product.ts
// Import the correct type 'Product'
import { Product as ProductType } from "@/types/dataTypes"; // Changed from ProductData, renamed import
import Base from "../base";

// Use the correct type 'ProductType'
type RecommendationsResponse = ProductType[];

class ProductRepository extends Base {
  // Renamed class for clarity
  getAllProducts = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };

  getProductByCategory = async (url: string) => {
    // Corrected generic type argument from <string>
    return this.http<ProductType[]>(url, "get");
  };

  getProductById = async (url: string) => {
    return this.http<ProductType>(url, "get");
  };

  updateProduct = async (url: string, variables: FormData) => {
    // Adjust <any> if specific response type is known
    return this.http<any>(url, "put", variables);
  };

  getProductBySearch = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };

  getRecommendations = async (url: string, userId: string) => {
    const queryParams = new URLSearchParams({ userId });
    return this.http<RecommendationsResponse>(`${url}?${queryParams}`, "get");
  };

  // Thêm phương thức lấy sản phẩm nổi bật
  getFeaturedProducts = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };
}

// Export instance with the new class name
export default new ProductRepository();
