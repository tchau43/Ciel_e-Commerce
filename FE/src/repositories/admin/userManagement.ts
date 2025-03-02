import { User } from "@/types/dataTypes";
import Base from "../base";

class userManagement extends Base {
  getAllUsers = async (url: string) => {
    // return this.http(url, "get");
    return this.http<User[]>(url, "get");
  };
}

export default new userManagement();
