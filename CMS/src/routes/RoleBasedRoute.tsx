import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  getAuthCredentials,
  isAuthenticated,
  clearAuthCredentials,
} from "../utils/authUtil";
import { Role } from "@/types/dataTypes";

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const RoleBasedRoute = ({ allowedRoles, children }: RoleBasedRouteProps) => {
  const navigate = useNavigate();
  const { role } = getAuthCredentials();

  useEffect(() => {
    if (!isAuthenticated()) {
      clearAuthCredentials();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  if (window.location.pathname === "/") {
    if (!isAuthenticated() || role === Role.CUSTOMER) {
      clearAuthCredentials();
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  }

  const isPublicRoute = window.location.pathname === "/login";

  if (isPublicRoute) {
    if (isAuthenticated()) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  if (!isAuthenticated()) {
    clearAuthCredentials();
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    clearAuthCredentials();
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
