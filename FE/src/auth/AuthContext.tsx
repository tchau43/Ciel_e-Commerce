import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthCredentials, clearAuthCredentials } from "../utils/authUtil";
import { UserReference, Role } from "../types/dataTypes";

interface AuthContextType {
  user: UserReference | null;
  role: Role | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  role: null,
  isAuthenticated: false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserReference | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Load auth credentials on initial render
    const { token, role: storedRole, userInfo } = getAuthCredentials();

    if (token && userInfo) {
      setUser(userInfo);
      setRole(storedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    clearAuthCredentials();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const authValue: AuthContextType = {
    user,
    role,
    isAuthenticated,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
