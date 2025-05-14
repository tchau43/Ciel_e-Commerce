import Base from "../base";
import { User as UserType } from "@/types/dataTypes";

class User extends Base {
  getUserById = async (url: string) => {
    return this.http(url, "get");
  };

  updateUserById = async (url: string, variables: UserType) => {
    return this.http<UserType>(url, "put", variables);
  };

  getDeliveredProducts = async (url: string) => {
    return this.http(url, "get");
  };
}

export default new User();
