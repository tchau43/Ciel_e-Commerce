import { Product as ProductType, VariantInput } from "@/types/dataTypes";
import Base from "../base";

interface RecommendationsResponse {
  products: ProductType[];
  message: string;
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

interface UpdateVariantData {
  types?: string;
  price?: number;
  stock?: number;
}

class ProductRepository extends Base {
  getAllProducts = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };

  getProductByCategory = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };

  getProductById = async (url: string) => {
    return this.http<ProductType>(url, "get");
  };

  createProduct = async (url: string, variables: FormData) => {
    return this.http<ProductType, FormData>(url, "post", variables);
  };

  updateProduct = async (url: string, variables: UpdateProductData) => {
    return this.http<ProductType, UpdateProductData>(url, "put", variables);
  };

  deleteProduct = async (url: string) => {
    return this.http<void>(url, "delete");
  };

  getProductBySearch = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };

  getRecommendations = async (url: string, userId: string) => {
    const queryParams = new URLSearchParams({ userId });
    return this.http<RecommendationsResponse>(
      url + "?" + queryParams.toString(),
      "get"
    );
  };

  getFeaturedProducts = async (url: string) => {
    return this.http<ProductType[]>(url, "get");
  };

  getVariantById = async (url: string) => {
    return this.http<ProductType>(url, "get");
  };

  addVariant = async (url: string, variables: VariantInput) => {
    return this.http<ProductType, VariantInput>(url, "post", variables);
  };

  updateVariant = async (url: string, variables: UpdateVariantData) => {
    return this.http<ProductType, UpdateVariantData>(url, "patch", variables);
  };

  updateVariantStock = async (url: string, variables: { stock: number }) => {
    return this.http<ProductType, { stock: number }>(url, "patch", variables);
  };

  deleteVariant = async (url: string) => {
    return this.http<void>(url, "delete");
  };
}
export default new ProductRepository();
