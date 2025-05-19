// src/utils/authUtil.ts (Updated)
import { Role, UserReference } from "../types/dataTypes"; // Import Role and UPDATED UserReference

// Define keys for localStorage for consistency
const AUTH_TOKEN_KEY = "access_token";
const AUTH_ROLE_KEY = "role";
const AUTH_USER_INFO_KEY = "userInfo";

// Type for the return value of getAuthCredentials
export interface AuthCredentials {
  token: string | null;
  role: Role | null;
  userInfo: UserReference | null; // Uses the updated UserReference
}

export function getAuthCredentials(): AuthCredentials {
  let token: string | null = null;
  let role: Role | null = null;
  let userInfo: UserReference | null = null;

  if (typeof window !== "undefined" && window.localStorage) {
    token = localStorage.getItem(AUTH_TOKEN_KEY);

    const roleString = localStorage.getItem(AUTH_ROLE_KEY);
    if (roleString && Object.values(Role).includes(roleString as Role)) {
      role = roleString as Role;
    }

    const userInfoString = localStorage.getItem(AUTH_USER_INFO_KEY);
    if (userInfoString) {
      try {
        const parsedInfo = JSON.parse(userInfoString);
        // Check for core fields, address/image are optional in the type
        if (
          parsedInfo &&
          typeof parsedInfo === "object" &&
          "_id" in parsedInfo &&
          "name" in parsedInfo &&
          "email" in parsedInfo
        ) {
          // Cast to the updated UserReference type
          userInfo = parsedInfo as UserReference;
        } else {
          console.error(
            "Stored userInfo format is invalid (missing core fields)."
          );
        }
      } catch (error) {
        console.error("Failed to parse userInfo from localStorage:", error);
      }
    }
  }

  return { token, role, userInfo };
}

// No changes needed to setAuthCredentials signature as it already uses UserReference
export function setAuthCredentials(
  token: string,
  role: Role,
  userInfo: UserReference // Uses the updated UserReference
): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_ROLE_KEY, role);
    localStorage.setItem(AUTH_USER_INFO_KEY, JSON.stringify(userInfo));
  } else {
    console.warn("localStorage is not available. Cannot set auth credentials.");
  }
}

// No changes needed to clearAuthCredentials
export function clearAuthCredentials(): void {
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(AUTH_USER_INFO_KEY);
  }
}
