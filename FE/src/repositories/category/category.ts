import { Category } from "@/types/dataTypes"; // Corrected import
import Base from "../base";

class CategoryRepository extends Base {
  // Renamed class
  // Method name corrected from getAllCetegories to getAllCategories
  getAllCategories = async (url: string): Promise<Category[]> => {
    // Use Category and add return type
    return this.http<Category[]>(url, "get"); // Use Category
  };
}

export default new CategoryRepository();
