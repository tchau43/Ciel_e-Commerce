import Base from "../base";
import { User as UserType, Address } from "@/types/dataTypes";

interface UpdateUserProfileData {
  name?: string;
  phoneNumber?: number;
  address?: Address;
}

interface UpdateProfileResponse {
  message: string;
  user: UserType;
}

interface UpdateUserPasswordData {
  oldPassword: string;
  newPassword: string;
}

interface UpdatePasswordResponse {
  message: string;
}

class User extends Base {
  getUserById = async (url: string) => {
    return this.http(url, "get");
  };

  updateUserById = async (url: string, variables: UserType) => {
    return this.http<UserType>(url, "put", variables);
  };

  updateProfile = async (url: string, variables: UpdateUserProfileData) => {
    return this.http<UpdateProfileResponse, UpdateUserProfileData>(
      url,
      "put",
      variables
    );
  };

  getDeliveredProducts = async (url: string) => {
    return this.http(url, "get");
  };

  updateUserPassword = async (
    url: string,
    variables: UpdateUserPasswordData
  ) => {
    return this.http<UpdatePasswordResponse, UpdateUserPasswordData>(
      url,
      "put",
      variables
    );
  };
}

export default new User();
