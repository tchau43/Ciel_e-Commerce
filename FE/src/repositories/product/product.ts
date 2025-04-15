import { ProductData } from "@/types/dataTypes";
import Base from "../base";

type RecommendationsResponse = ProductData[];

class Product extends Base {
  getAllProducts = (url: string) => {
    return this.http(url, "get");
  };

  getProductByCategory = (url: string) => {
    const res = this.http<string>(url, "get");
    return res;
  };

  getProductById = (url: string) => {
    return this.http(url, "get");
  };

  updateProduct = (url: string, variables: FormData) => {
    return this.http(url, "put", variables);
  };

  getProductBySearch = (url: string) => {
    return this.http(url, "get");
  };

  getRecommendations = (url: string) => {
    // Fetches data from GET /recommendations/?userId=...
    // Expects an array of ProductData objects in response
    return this.http<RecommendationsResponse>(url, "get");
  };
}

export default new Product();
