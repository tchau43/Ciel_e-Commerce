import { Role, UserInfo } from "../types/dataTypes";

export function getAuthCredentials() {
  const token = localStorage.getItem("token");
  // const role = localStorage.getItem("role") as Role | null;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") as string) as UserInfo;
  const role = localStorage.getItem("role") as Role | "USER";
  return { token, role, userInfo };
}

export function setAuthCredentials(token: string, role: Role, userInfo: UserInfo) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

export function clearAuthCredentials() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("role");
  localStorage.removeItem("userInfo");
}
