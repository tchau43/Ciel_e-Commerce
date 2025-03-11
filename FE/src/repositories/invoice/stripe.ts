import { InvoiceInputData, StripeData } from "@/types/dataTypes";
import Base from "../base";

class Stripe extends Base {
  createStripe = (url: string, variables: StripeData) => {
    return this.http(url, "post", variables);
  };
}

export default new Stripe();
