import { User as UserType } from "@/types/dataTypes";
import Base from "../base";

class User extends Base {
  getUserById = async (url: string) => {
    return this.http<UserType>(url, "get");
  };

  updateUserById = async (url: string, variables: UserType) => {
    return this.http<UserType>(url, "put", variables);
  };

  getDeliveredProducts = async (url: string) => {
    return this.http<any>(url, "get");
  };
}

export default new User();
