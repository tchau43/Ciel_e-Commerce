import { UpdateCartItemData } from "@/types/dataTypes";
import Base from "../base";
import { url } from "inspector";

class Cart extends Base {
  updateCart = (url: string, variables: UpdateCartItemData) => {
    return this.http(url, "post", variables);
  };

  getCart = (url: string) => {
    return this.http(url, "get");
  };

  deleteProductInCart = (url: string) => {
    return this.http(url, "delete");
  };

  // addProductToCart = (url: string, variables: UpdateCartItemData) => {
  //   return this.http(url, "post", variables);
  // };
}

export default new Cart();
