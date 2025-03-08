import Base from "../base";

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
}

export default new Product();
