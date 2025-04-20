export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  MODERATOR = "MODERATOR",
}

export type UserInfo = {
  _id: string;
  email?: string;
  name: string;
  address: string;
};

export declare type LoginInput = {
  email: string;
  password: string;
};

export declare type LoginWithTokenInput = {
  access_token: string;
  id: string;
};

export declare type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export declare type User = {
  _id: number;
  createdDate: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: Role;
  status: boolean;
};

export declare type CategoryData = {
  _id: string;
  name: string;
};

export declare type BrandData = {
  _id: string;
  name: string;
};

export declare type VariantData = {
  _id: string;
  types: string;
  price: number;
};

export declare type ProductData = {
  _id: string;
  name: string;
  base_price: number;
  category: CategoryData;
  brand: BrandData;
  tags: string[];
  status: string;
  images: string[];
  image?: File | string;
  createdAt: string;
  updatedAt: string;
  description: [string];
  url: string;
  variants: [VariantData];
};

// Define the main type for the payment confirmation email data
export declare type EmailPaymentData = {
  userEmail: string;
  invoiceId: string;
  items: EmailItemData[];
  totalAmount: number;
  paymentStatus: InvoicePaymentStatus;
  shippingAddress?: ShippingAddress;
};

export declare type EmailItemData = {
  name: string;
  quantity: number;
  price?: number;
};

export declare type UpdateCartItemData = {
  userId: string;
  productId: ProductData["_id"];
  variantId?: string | null; // <-- ADD THIS (optional)
  quantity: number;
};

// Also update CartItemData for clarity on what the cart fetch returns
export declare type CartItemData = {
  product: ProductData; // This holds ALL variants
  variant?: string; // The ID of the selected variant FOR THIS cart line item
  quantity: number;
  _id: string; // This is the ID of the cart item itself, often default behaviour of Mongoose
};

export declare type CartData = {
  _id: string | null; // Can be null if cart was just created virtually
  user: string;
  items: CartItemData[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

export declare type StripeData = {
  amount: number;
};

//invoice
export declare type InvoiceResponse = {
  _id: string;
  user: Partial<User>; // Or a more specific User subset if needed
  items: InvoiceItems[];
  totalAmount: number;
  paymentStatus: InvoicePaymentStatus; // Use the enum
  shippingAddress?: ShippingAddress; // Add the structured address (optional if it might not exist)
  createdAt: string;
  updatedAt: string; // Add updatedAt from schema timestamps
  paymentMethod: PaymentMethod;
};

export declare type ShippingAddress = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
};

export enum InvoicePaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUND = "refund",
}

export enum PaymentMethod {
  CARD = "CARD",
  CASH = "CASH", // thanh toán bằng tiền mặt
  BANK_TRANSFER = "BANK_TRANSFER",
}

export declare type InvoiceRequest = {
  userId: string;
  productsList: InvoiceProductInputData[];
  paymentMethod: PaymentMethod;
  paymentStatus: InvoicePaymentStatus;
  shippingAddress: ShippingAddress;
};

export declare type InvoiceProductInputData = {
  productId: string;
  quantity: number;
  variantId?: string | null; // <-- ADD VARIANT ID HERE
};

export declare type InvoiceItems = {
  _id: string;
  product: ProductData;
  quantity: number;
  priceAtPurchase: number;
};

//Home Page
export declare type HomePageRes = {
  banners: BannerHomePage[];
  videos: VideoHomePage[];
  features: FeatureHomePage[];
};

export declare type BannerHomePage = {
  photo_url: string;
};

export declare type VideoHomePage = {
  title: string;
  photo_url: string;
  video_youtube: string;
  photo_thumb: string;
};

export declare type FeatureHomePage = {
  title: string;
  description: string;
  image_url: string;
};
