import Base from "../base";

interface CouponValidationResponse {
  valid: boolean;
  coupon: {
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    calculatedDiscount: number;
  };
}

class Coupon extends Base {
  validateCoupon = async (url: string): Promise<CouponValidationResponse> => {
    return this.http(url, "get");
  };
}

export default new Coupon();
