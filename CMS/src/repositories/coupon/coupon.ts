import Base from "../base";

interface CouponItem {
  _id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minPurchaseAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouponResponse {
  success: boolean;
  coupons: CouponItem[];
  message?: string;
}

interface SingleCouponResponse {
  success: boolean;
  coupon: CouponItem;
  message?: string;
}

class Coupon extends Base {
  getAllCoupons = async (url: string) => {
    return this.http<CouponResponse>(url, "get");
  };

  getCouponById = async (url: string) => {
    return this.http<SingleCouponResponse>(url, "get");
  };

  createCoupon = async (url: string, variables: Partial<CouponItem>) => {
    return this.http<SingleCouponResponse>(url, "post", variables as any);
  };

  updateCoupon = async (url: string, variables: Partial<CouponItem>) => {
    return this.http<SingleCouponResponse>(url, "patch", variables as any);
  };

  deleteCoupon = async (url: string) => {
    return this.http<{ success: boolean; message: string }>(url, "delete");
  };
}

export default new Coupon();
