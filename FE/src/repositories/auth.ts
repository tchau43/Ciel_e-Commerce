import { RegisterInput } from "../types/dataTypes";
import Base from "./base";

class User extends Base{
  register = async (url: string, variables: RegisterInput) => {
    return this.http<RegisterInput>(url, "post", variables);
  };
}