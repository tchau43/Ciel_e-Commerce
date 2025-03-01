import Base from "../base";

class userManagement extends Base {
  getAllUsers = async (url: string) => {
    return this.http(url, "get");
  };
}

export default new userManagement();
