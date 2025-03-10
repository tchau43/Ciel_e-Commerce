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
  createdDate: string;
  email: string;
  name: string | null;
  _id: number;
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

export declare type InvoiceInputData = {
  userId: string;
  productsList: CartItemData[];
  payment: string;
  address: string;
};
