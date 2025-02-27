import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthCredentials } from "../utils/authUtil";

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const RoleBasedRoute = ({ allowedRoles, children }: RoleBasedRouteProps) => {
  const { token, role } = getAuthCredentials();

  // Check if the current route is a public route that doesn't need authentication
  const isPublicRoute =
    window.location.pathname === "/landing" ||
    window.location.pathname === "/login" ||
    window.location.pathname === "/register";

  // Allow access to public routes without authentication
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If the user is not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If the user doesn't have the required role, redirect to not found page
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/notfound" />;
  }

  // If the user is authenticated and has the correct role, render the children
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
