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
  description: string;
};

export declare type ProductData = {
  _id: string;
  name: string;
  price: string;
  category: CategoryData;
  images: string;
  tags: string[];
  quantity_in_stock: number;
  shortDescription: string;
  description: string;
  moreInfomation: string;
};

export declare type UpdateCartItemData = {
  userId: string;
  productId: ProductData["_id"];
  changeQuantity: number;
};

export declare type CartItemData = {
  product: ProductData;
  quantity: number;
  _id: string;
};

export declare type CartData = {
  _id: string;
  user: string;
  items: CartItemData[];
  totalPrice: number;
};

export declare type InvoiceProductInputData = {
  productId: string;
  quantity: number;
};

export declare type InvoiceRequest = {
  userId: string;
  productsList: InvoiceProductInputData[];
  payment: string;
  address: string;
};

export declare type StripeData = {
  amount: number;
};

export declare type InvoiceResponse = {
  _id: string;
  user: Partial<User>;
  items: ProductData[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
};
