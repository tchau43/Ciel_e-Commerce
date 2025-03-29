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

export declare type ProductRes = {
  _id: string;
  name: string;
  price: string;
  category: CategoryData;
  tags: string[];
  status: string;
  quantity_in_stock: number;
  images: string[];
  createdAt: string;
  brand: string;
  description: string;
  shortDescription: string;
  moreInfomation: string;
};

export declare type ProductReq = {
  _id: string;
  name: string;
  price: string;
  category: CategoryData;
  tags: string[];
  status: string;
  quantity_in_stock: number;
  images: string[];
  image?: File | string; // New image upload (File in FE, string path in BE)
  createdAt: string;
  brand: string;
  description: string;
  shortDescription: string;
  moreInfomation: string;
};

export declare type UpdateCartItemData = {
  userId: string;
  productId: ProductRes["_id"];
  changeQuantity: number;
};

export declare type CartItemData = {
  product: ProductRes;
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

//invoice
export declare type InvoiceResponse = {
  _id: string;
  user: Partial<User>;
  items: InvoiceItems[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
};
export declare type InvoiceItems = {
  _id: string;
  product: ProductRes;
  quantity: number;
  priceAtPurchase: number;
};

declare global {
  namespace Express {
    interface Request {
      file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
      };
    }
  }
}
