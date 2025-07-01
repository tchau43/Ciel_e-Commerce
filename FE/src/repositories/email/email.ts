import { NotifyPaymentSuccessInput } from "@/types/dataTypes"
import Base from "../base";

class EmailRepository extends Base {
  postSendEmailPaymentStatus = (
    url: string,
    variables: NotifyPaymentSuccessInput
  ): Promise<any> => {
    return this.http<any>(url, "post", variables);
  };
}

export default new EmailRepository();
