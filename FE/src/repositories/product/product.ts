

import { Product as ProductType } from "@/types/dataTypes"; 
import Base from "../base";


type RecommendationsResponse = ProductType[];

class ProductRepository extends Base {
  
  getAllProducts = (url: string): Promise<ProductType[]> => {
    return this.http<ProductType[]>(url, "get");
  };

  getProductByCategory = (url: string): Promise<ProductType[]> => {
    
    return this.http<ProductType[]>(url, "get");
  };

  getProductById = (url: string): Promise<ProductType> => {
    return this.http<ProductType>(url, "get");
  };

  updateProduct = (url: string, variables: FormData): Promise<any> => {
    
    return this.http<any>(url, "put", variables);
  };

  getProductBySearch = (url: string): Promise<ProductType[]> => {
    return this.http<ProductType[]>(url, "get");
  };

  getRecommendations = (
    url: string,
    userId: string
  ): Promise<RecommendationsResponse> => {
    const queryParams = new URLSearchParams({ userId });
    return this.http<RecommendationsResponse>(`${url}?${queryParams}`, "get");
  };

  
  getFeaturedProducts = (url: string): Promise<ProductType[]> => {
    return this.http<ProductType[]>(url, "get");
  };
}


export default new ProductRepository();
