import { StripeData } from "@/types/dataTypes";
import Base from "../base";

class Stripe extends Base {
  createStripe = async (url: string, variables: StripeData) => {
    return this.http<StripeData>(url, "post", variables);
  };
}

export default new Stripe();
