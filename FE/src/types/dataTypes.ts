// src/types/dataTypes.ts

// =============================
// CORE ENUMS (Các hằng số dùng chung)
// =============================

export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export enum PaymentStatus { // Dùng cho Invoice
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
}

export enum OrderStatus { // Dùng cho Invoice
  PENDING = "pending", // Lưu ý: Có vẻ OrderStatus không nên có PENDING, BE model chỉ có processing, shipped, delivered, cancelled, returned. Xem xét lại enum này.
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
}

export enum PaymentMethod { // Dùng cho Invoice
  CARD = "CARD",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum CouponDiscountType { // Dùng cho Coupon
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

// =============================
// BASE & UTILITY TYPES (Kiểu cơ sở và tiện ích)
// =============================

// Kiểu cơ sở cho mọi document từ MongoDB
export type BaseDoc = {
  _id: string;
  createdAt: string; // Luôn là string từ JSON
  updatedAt: string; // Luôn là string từ JSON
};

// Địa chỉ giao hàng/thông tin địa chỉ chung
export type Address = {
  street?: string;
  city?: string;
  state?: string; // Tỉnh/Thành phố
  country?: string;
  zipCode?: string;
};

// Kiểu tham chiếu cơ bản (chỉ ID và name)
export type BaseReference = Pick<BaseDoc, "_id"> & { name: string };

// Kiểu dữ liệu cho API trả về có phân trang (Chung)
export type Paginated<T> = {
  data: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  // Có thể thêm các trường phân trang khác nếu BE trả về
};

// Kiểu dữ liệu chung cho các tham số query admin (tìm kiếm, phân trang, sắp xếp)
// *** START: Added Type ***
export type BaseAdminQueryParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
// *** END: Added Type ***

// =============================
// ENTITY TYPES (Kiểu cho các thực thể chính)
// =============================

// --- User ---
export type User = BaseDoc & {
  name: string;
  email: string;
  role: Role;
  status: boolean;
  image?: string;
  address?: Address; // Sử dụng lại Address type
  phoneNumber?: number; // Cân nhắc đổi thành string nếu có thể chứa ký tự đặc biệt (+, -, space)
};

export type UserReference = Pick<User, "_id" | "name" | "email"> & {
  address?: Address;
  image?: string;
};

// --- Category ---
export type Category = BaseDoc & {
  name: string;
  description?: string;
};
export type CategoryReference = BaseReference; // ID và name là đủ

// --- Brand ---
export type Brand = BaseDoc & {
  name: string;
  description?: string; // Hoặc logoUrl,... nếu có
};
export type BrandReference = BaseReference; // ID và name là đủ

// --- Variant ---
export type Variant = BaseDoc & {
  types: string; // Ví dụ: "Màu:Đỏ, Size:XL"
  price: number;
  stock: number;
  product: string; // ID sản phẩm cha
};
export type VariantReference = Pick<
  Variant,
  "_id" | "types" | "price" | "stock"
>; // Tham chiếu biến thể (có thể cần stock)

// --- Product ---
export type Product = BaseDoc & {
  name: string;
  base_price: number;
  description?: string[];
  category: CategoryReference; // Dùng reference
  brand?: BrandReference; // Dùng reference, optional
  tags?: string[];
  images: string[];
  averageRating?: number;
  numberOfReviews?: number;
  variants: Variant[]; // Chi tiết sẽ có danh sách variant đầy đủ
};

// Dùng cho danh sách sản phẩm, ít chi tiết hơn
export type ProductSummary = Omit<Product, "variants" | "description"> & {
  variants: string[]; // Chỉ trả về ID của variants trong danh sách
};

export type ProductReference = Pick<
  Product,
  "_id" | "name" | "images" | "category" | "brand" | "base_price" // Thêm base_price có thể hữu ích
>; // Dùng khi product nhúng vào entity khác (InvoiceItem)

// --- Cart ---
// Item trong giỏ hàng có cấu trúc khá đặc thù từ BE, khó gộp chung
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
  user: string; // User ID
  items: CartItem[];
  calculatedTotalPrice: number;
};

// --- Invoice ---
export type InvoiceItem = {
  product: ProductReference; // Dùng reference
  variant: VariantReference; // Dùng reference variant đầy đủ hơn
  quantity: number;
  priceAtPurchase: number; // Giá tại thời điểm mua (có thể khác giá hiện tại)
};

export type Invoice = BaseDoc & {
  user: UserReference; // Dùng reference user đầy đủ hơn
  items: InvoiceItem[];
  subtotal: number; // Thêm subtotal để rõ ràng
  couponCode?: string;
  discountAmount?: number;
  deliveryFee?: number; // Thêm deliveryFee
  totalAmount: number;
  shippingAddress: Address; // Dùng lại Address type
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentIntentId?: string; // ID từ Stripe (nếu có)
};

// --- Review ---
export type Review = BaseDoc & {
  user: UserReference; // Dùng reference
  product: string; // Product ID
  variant?: Pick<VariantReference, "_id" | "types">; // Chỉ cần type của variant
  rating: number;
  comment?: string;
};

// --- Coupon ---
export type Coupon = BaseDoc & {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt: string; // ISO Date string
  isActive: boolean;
};

// --- HomePage ---
// Gom các item của homepage lại, dùng optional fields
export type HomePageItem = BaseDoc & {
  // Giả sử mỗi item cũng có _id, createdAt,...
  title?: string;
  description?: string;
  photo_url?: string; // Dùng cho banner, video
  image_url?: string; // Dùng cho feature
  video_youtube?: string; // Dùng cho video
  photo_thumb?: string; // Dùng cho video
};

export type HomePage = BaseDoc & {
  // Document chứa cấu hình trang chủ
  banners: HomePageItem[];
  videos: HomePageItem[];
  features: HomePageItem[];
};

// =============================
// API INPUT TYPES (Kiểu cho dữ liệu gửi đi)
// =============================
// Đặt tên theo [Action?][Entity]Input

// --- Auth ---
export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  name: string;
  address?: Address; // Dùng lại Address type
  phoneNumber?: string;
};

// --- User Update (Admin) ---
export type UpdateUserInput = Partial<Pick<User, "name" | "status" | "role">>; // Chỉ cho phép cập nhật các trường này

// --- Category/Brand Create/Update ---
export type CategoryInput = Pick<Category, "name" | "description">;
export type BrandInput = Pick<Brand, "name" | "description">;

// --- Variant Create/Update ---
export type VariantInput = Pick<Variant, "types" | "price" | "stock">;

// --- Product Create/Update ---
export type ProductInput = {
  name: string;
  base_price: number;
  description?: string[];
  category: string; // Gửi ID hoặc Name
  brand?: string; // Gửi ID hoặc Name
  tags?: string[];
  images?: string[];
  // Khi tạo mới có thể gửi kèm variants, khi cập nhật thì không
  variants?: VariantInput[];
};

export type UpdateProductInput = Omit<ProductInput, "variants">;

export type ProductBatchInput = { ids: string[] }; // Lấy product theo danh sách ID

// --- Cart ---
export type CartItemInput = {
  productId: string;
  variantId?: string | null; // variantId có thể là null nếu mua base product? Hoặc luôn yêu cầu?
  quantity: number; // = 0 để xóa
};

// --- Invoice ---
export type InvoiceItemInput = Pick<
  CartItemInput,
  "productId" | "variantId" | "quantity"
>; // Giống CartItemInput nhưng quantity > 0

export type CreateInvoiceInput = {
  productsList: InvoiceItemInput[];
  paymentMethod: PaymentMethod;
  shippingAddress: Address; // Dùng lại Address type
  couponCode?: string;
};

export type UpdateInvoiceStatusInput = Partial<
  Pick<Invoice, "orderStatus" | "paymentStatus">
>;

// --- Review ---
export type CreateReviewInput = {
  productId: string;
  variantId?: string; // Review có thể cho cả product hoặc variant cụ thể
  rating: number;
  comment?: string;
};

// --- Coupon ---
// Dùng chung cho Create/Update, bỏ các trường không được sửa khi update
export type CouponInput = Omit<Coupon, keyof BaseDoc | "usedCount">;

// --- HomePage Update ---
// Gửi toàn bộ hoặc một phần của HomePageItem, _id là optional khi tạo mới
export type UpdateHomePageItemInput = Partial<
  Omit<HomePageItem, keyof BaseDoc>
> & { _id?: string };

// =============================
// API SPECIFIC RESPONSE TYPES (Kiểu cho các response đặc biệt)
// =============================

// --- Auth ---
export type LoginResponse = {
  message: string;
  EC: number; // Error Code?
  accessToken: string;
  user: Pick<User, "_id" | "name" | "email" | "role"> & {
    address?: Address;
    image?: string;
  };
};

// --- Stripe ---
export type StripeInitiateResponse = {
  clientSecret: string | null; // Có thể null nếu lỗi
  invoiceId: string;
  totalAmount: number;
};

// --- Coupon Validation ---
export type ValidateCouponResponse = {
  valid: boolean;
  reason?: string;
  coupon?: Pick<
    Coupon,
    "code" | "description" | "discountType" | "discountValue" | "minPurchaseAmount"
  > & {
    calculatedDiscount?: number; // Frontend tự tính hay BE trả về?
  };
};

// --- Chatbot ---
export type ChatbotInput = { message: string };
export type ChatbotResponse = { reply: string };

// --- Recommendations ---
// Kiểu này phụ thuộc vào response thực tế từ service recommendations
export type RecommendationResponse = {
  recommendedProductIds?: string[];
  // Hoặc trả về danh sách ProductSummary?
  // recommendedProducts?: ProductSummary[];
};

// --- Email Notification ---
export type NotifyPaymentSuccessInput = { invoiceId: string }; // Chỉ cần ID hóa đơn

// --- Admin Invoice List Response ---
// *** START: Added Type ***
export type AdminInvoicePaginatedResponse = {
  invoices: Invoice[]; // Mảng các hóa đơn (đã populate user)
  currentPage: number; // Trang hiện tại
  totalPages: number; // Tổng số trang
  totalInvoices: number; // Tổng số hóa đơn khớp query
};
// *** END: Added Type ***