import Base from "../base";

class CustomerHomePage extends Base {
  getHomePageData = async (url: string) => {
    return this.http(url, "get");
  };
}

export default new CustomerHomePage();
