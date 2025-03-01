export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
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
