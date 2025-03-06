import { CategoryData } from "@/types/dataTypes";
import Base from "../base";

class Category extends Base {
  getAllCetegories = async (url: string) => {
    return this.http<CategoryData[]>(url, "get");
  };
}

export default new Category();
