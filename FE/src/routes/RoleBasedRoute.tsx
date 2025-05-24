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
    // Check authentication on mount and when dependencies change
    if (!isAuthenticated()) {
      clearAuthCredentials();
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  // Handle root path
  if (window.location.pathname === "/") {
    if (role === Role.CUSTOMER) {
      return <>{children}</>;
    }
    clearAuthCredentials();
    return <Navigate to="/landing" replace />;
  }

  // Check if the current route is a public route
  const isPublicRoute =
    window.location.pathname === "/landing" ||
    window.location.pathname === "/auth";

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    // If user is already authenticated and tries to access auth page, redirect to home
    if (isAuthenticated() && window.location.pathname === "/auth") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // If not authenticated, clear any existing credentials and redirect to auth
  if (!isAuthenticated()) {
    clearAuthCredentials();
    return <Navigate to="/auth" replace />;
  }

  // If the user doesn't have the required role, clear credentials and redirect
  if (!role || !allowedRoles.includes(role)) {
    clearAuthCredentials();
    return <Navigate to="/auth" replace />;
  }

  // If the user is authenticated and has the correct role, render the children
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
