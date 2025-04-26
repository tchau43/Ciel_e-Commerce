import { NotifyPaymentSuccessInput } from "@/types/dataTypes"; // Corrected import
import Base from "../base";

class EmailRepository extends Base {
  // Renamed class
  postSendEmailPaymentStatus = (
    url: string,
    variables: NotifyPaymentSuccessInput
  ): Promise<any> => {
    // Use NotifyPaymentSuccessInput and add basic return type
    // Specify response type if known, e.g. <{ success: boolean }>
    return this.http<any>(url, "post", variables);
  };
}

export default new EmailRepository();
