import { LoginInput, RegisterInput, LoginResponse } from "@/types/dataTypes";
import Base from "./base";

class Auth extends Base {
  register = async (url: string, variables: RegisterInput) => {
    return this.http<RegisterInput>(url, "post", variables);
  };

  login = async (url: string, variables: LoginInput) => {
    return this.http<LoginResponse>(url, "post", variables);
  };
}

export default new Auth();
