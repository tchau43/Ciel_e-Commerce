





export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export enum PaymentStatus { 
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum OrderStatus { 
  PENDING = "pending", 
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum PaymentMethod { 
  CARD = "CARD",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum CouponDiscountType { 
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}






export type BaseDoc = {
  _id: string;
  createdAt: string; 
  updatedAt: string; 
};


export type Address = {
  street?: string;
  city?: string;
  state?: string; 
  country?: string;
  zipCode?: string;
};


export type BaseReference = Pick<BaseDoc, "_id"> & { name: string };


export type Paginated<T> = {
  data: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  
};



export type BaseAdminQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};







export type User = BaseDoc & {
  name: string;
  email: string;
  role: Role;
  status: boolean;
  image?: string;
  address?: Address; 
  phoneNumber?: number; 
};

export type UserReference = Pick<User, "_id" | "name" | "email"> & {
  address?: Address;
  image?: string;
};


export type Category = BaseDoc & {
  name: string;
  description?: string;
};
export type CategoryReference = BaseReference; 


export type Brand = BaseDoc & {
  name: string;
  description?: string; 
};
export type BrandReference = BaseReference; 


export type Variant = BaseDoc & {
  types: string; 
  price: number;
  stock: number;
  product: string; 
};
export type VariantReference = Pick<
  Variant,
  "_id" | "types" | "price" | "stock"
>; 


export type Product = BaseDoc & {
  name: string;
  base_price: number;
  description?: string[];
  category: CategoryReference; 
  brand?: BrandReference; 
  tags?: string[];
  images: string[];
  averageRating?: number;
  numberOfReviews?: number;
  purchasedQuantity?: number; 
  variants: Variant[]; 
};


export type ProductSummary = Omit<Product, "variants" | "description"> & {
  variants: string[]; 
};

export type ProductReference = Pick<
  Product,
  "_id" | "name" | "images" | "category" | "brand" | "base_price" 
>; 



export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  variantTypes?: string;
  pricePerUnit: number;
  subtotal: number;
  imageUrl?: string;
  stock?: number;
  category?: CategoryReference;
  brand?: BrandReference;
};

export type Cart = BaseDoc & {
  user: string; 
  items: CartItem[];
  calculatedTotalPrice: number;
};


export type InvoiceItem = {
  product: ProductReference; 
  variant: VariantReference; 
  quantity: number;
  priceAtPurchase: number; 
};

export type Invoice = BaseDoc & {
  user: UserReference; 
  items: InvoiceItem[];
  subtotal: number; 
  couponCode?: string;
  discountAmount?: number;
  deliveryFee?: number; 
  totalAmount: number;
  shippingAddress: Address; 
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentIntentId?: string; 
};


export type Review = BaseDoc & {
  user: UserReference; 
  product: string; 
  variant?: Pick<VariantReference, "_id" | "types">; 
  rating: number;
  comment?: string;
};


export type Coupon = BaseDoc & {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt: string; 
  isActive: boolean;
};



export type HomePageItem = BaseDoc & {
  
  title?: string;
  description?: string;
  photo_url?: string; 
  image_url?: string; 
  video_youtube?: string; 
  photo_thumb?: string; 
};

export type HomePage = BaseDoc & {
  
  banners: HomePageItem[];
  videos: HomePageItem[];
  features: HomePageItem[];
};







export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  address?: Address; 
  phoneNumber?: string;
};


export type UpdateUserInput = Partial<Pick<User, "name" | "status" | "role">>; 


export type CategoryInput = Pick<Category, "name" | "description">;
export type BrandInput = Pick<Brand, "name" | "description">;


export type VariantInput = Pick<Variant, "types" | "price" | "stock">;


export type ProductInput = {
  name: string;
  base_price: number;
  description?: string[];
  category: string; 
  brand?: string; 
  tags?: string[];
  images?: string[];
  
  variants?: VariantInput[];
};

export type UpdateProductInput = Omit<ProductInput, "variants">;

export type ProductBatchInput = { ids: string[] }; 


export type CartItemInput = {
  productId: string;
  variantId?: string | null; 
  quantity: number; 
};


export type InvoiceItemInput = Pick<
  CartItemInput,
  "productId" | "variantId" | "quantity"
>; 

export interface CreateInvoiceInput {
  userId: string;
  shippingAddress: Address;
  productsList: {
    productId: string;
    quantity: number;
    variantId?: string | null;
  }[];
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  deliveryFee: number;
}

export type UpdateInvoiceStatusInput = Partial<
  Pick<Invoice, "orderStatus" | "paymentStatus">
>;


export type CreateReviewInput = {
  productId: string;
  variantId?: string; 
  rating: number;
  comment?: string;
};



export type CouponInput = Omit<Coupon, keyof BaseDoc | "usedCount">;



export type UpdateHomePageItemInput = Partial<
  Omit<HomePageItem, keyof BaseDoc>
> & { _id?: string };






export type LoginResponse = {
  message: string;
  EC: number; 
  accessToken: string;
  user: Pick<User, "_id" | "name" | "email" | "role"> & {
    address?: Address;
    image?: string;
  };
};


export type InitiatePaymentVariables = {
  userId: string;
  productsList: InvoiceItemInput[];
  shippingAddress: Address;
};

export type InitiatePaymentResponse = {
  clientSecret: string;
  invoiceId: string;
  totalAmount: number;
};


export type ValidateCouponResponse = {
  valid: boolean;
  reason?: string;
  coupon?: Pick<
    Coupon,
    | "code"
    | "description"
    | "discountType"
    | "discountValue"
    | "minPurchaseAmount"
  > & {
    calculatedDiscount?: number; 
  };
};


export interface ChatMessage {
  _id: string;
  sessionId: string;
  sender: "user" | "bot";
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotInput {
  message: string;
  threadId?: string;
}

export interface ChatbotResponse {
  success: boolean;
  reply: string;
  threadId: string;
  chatHistory: ChatMessage[];
}

export interface ChatHistoryResponse {
  success: boolean;
  threadId: string;
  chatHistory: ChatMessage[];
}



export type RecommendationResponse = {
  recommendedProductIds?: string[];
  
  
};


export type NotifyPaymentSuccessInput = { invoiceId: string }; 



export type AdminInvoicePaginatedResponse = {
  invoices: Invoice[]; 
  currentPage: number; 
  totalPages: number; 
  totalInvoices: number; 
};



export type StripeData = {
  invoiceId: string;
  amount: number;
  currency?: string;
};
