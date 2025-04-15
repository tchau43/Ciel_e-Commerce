import Base from "../base";

class Product extends Base {
  getRecommendationProducts = (url: string) => {
    return this.http(url, "get");
  };
}

export default new Product();
