import { User as UserType, Address } from "@/types/dataTypes";
import Base from "../base";

interface UpdateUserData {
  name?: string;
  status?: boolean;
  role?: string;
  address?: Address;
  phoneNumber?: string;
  oldPassword?: string;
  newPassword?: string;
}

interface UpdateUserResponse {
  message: string;
  user: UserType;
}

class User extends Base {
  getUserById = async (url: string) => {
    return this.http<UserType>(url, "get");
  };

  getDeliveredProducts = async (url: string) => {
    return this.http<any>(url, "get");
  };

  updateUser = async (url: string, data: UpdateUserData) => {
    return this.http<UpdateUserResponse>(url, "put", data as any);
  };
}

export default new User();
