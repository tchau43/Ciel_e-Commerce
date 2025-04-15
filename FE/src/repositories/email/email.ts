import { EmailPaymentData } from "@/types/dataTypes";
import Base from "../base";

class Email extends Base {
  postSendEmailPaymentStatus = (url: string, variables: EmailPaymentData) => {
    return this.http(url, "post", variables);
  };
}

export default new Email();
