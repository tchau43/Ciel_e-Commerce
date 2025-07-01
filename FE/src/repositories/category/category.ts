import { Category } from "@/types/dataTypes"; 
import Base from "../base";

class CategoryRepository extends Base {
  getAllCategories = async (url: string): Promise<Category[]> => {
    return this.http<Category[]>(url, "get"); 
  };
}

export default new CategoryRepository();
