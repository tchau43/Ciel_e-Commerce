import { CartData } from "@/types/dataTypes";
import Base from "../base";

class Cart extends Base {
  updateCart = (url: string, variables: CartData) => {
    return this.http(url, "post", variables);
  };
}

export default new Cart();
