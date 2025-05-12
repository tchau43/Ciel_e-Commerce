// src/repositories/product/product.ts
// Import the correct type 'Product'
import { Product as ProductType } from "@/types/dataTypes"; // Changed from ProductData, renamed import
import Base from "../base";

// Use the correct type 'ProductType'
type RecommendationsResponse = ProductType[];

class ProductRepository extends Base {
  // Renamed class for clarity
  getAllProducts = (url: string): Promise<ProductType[]> => {
    return this.http<ProductType[]>(url, "get");
  };

  getProductByCategory = (url: string): Promise<ProductType[]> => {
    // Corrected generic type argument from <string>
    return this.http<ProductType[]>(url, "get");
  };

  getProductById = (url: string): Promise<ProductType> => {
    return this.http<ProductType>(url, "get");
  };

  updateProduct = (url: string, variables: FormData): Promise<any> => {
    // Adjust <any> if specific response type is known
    return this.http<any>(url, "put", variables);
  };

  getProductBySearch = (url: string): Promise<ProductType[]> => {
    return this.http<ProductType[]>(url, "get");
  };

  getRecommendations = (url: string): Promise<RecommendationsResponse> => {
    return this.http<RecommendationsResponse>(url, "get");
  };

  // Thêm phương thức lấy sản phẩm nổi bật
  getFeaturedProducts = (url: string): Promise<ProductType[]> => {
    return this.http<ProductType[]>(url, "get");
  };
}

// Export instance with the new class name
export default new ProductRepository();
