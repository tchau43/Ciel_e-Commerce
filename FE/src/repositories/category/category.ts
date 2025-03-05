import Base from "../base";

class Category extends Base {
  getAllCetegories = async (url: string) => {
    this.http(url, "get");
  };
}

export default new Category();
