export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
  MODERATOR = "MODERATOR",
}

export type UserInfo = {
  // id: string;
  email?: string;
  name: string;
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
  role: string;
  status: boolean;
};

export declare type Category = {
  name: string;
  description: string;
};
