import { LoginInput, RegisterInput } from "../types/dataTypes";
import Base from "./base";

class User extends Base{
  register = async (url: string, variables: RegisterInput) => {
    return this.http<RegisterInput>(url, "post", variables);
  };

  login = async (url: string, variables: LoginInput) => {
    return this.http<LoginInput>(url, "post", variables);
  };
}