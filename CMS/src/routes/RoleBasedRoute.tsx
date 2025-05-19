import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthCredentials } from "../utils/authUtil";
import { Role } from "@/types/dataTypes";

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const RoleBasedRoute = ({ allowedRoles, children }: RoleBasedRouteProps) => {
  const { token, role } = getAuthCredentials();

  // console.log(token);
  if (window.location.pathname === "/") {
    if (role === Role.CUSTOMER) {
      return <>{children}</>;
    } else
      return (
        <>
          <Navigate to="/landing" />
        </>
      );
  }

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

  // If the user doesn't have the required role or role is null, redirect to not found page
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/notfound" />;
  }

  // If the user is authenticated and has the correct role, render the children
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
