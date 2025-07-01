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
      navigate("/landing", { replace: true });
    }
  }, [navigate]);

  
  if (window.location.pathname === "/") {
    if (role === Role.CUSTOMER) {
      return <>{children}</>;
    }
    clearAuthCredentials();
    return <Navigate to="/landing" replace />;
  }

  
  const isPublicRoute =
    window.location.pathname === "/landing" ||
    window.location.pathname === "/auth";

  
  if (isPublicRoute) {
    
    if (isAuthenticated() && window.location.pathname === "/auth") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  
  if (!isAuthenticated()) {
    clearAuthCredentials();
    return <Navigate to="/landing" replace />;
  }

  
  if (!role || !allowedRoles.includes(role)) {
    clearAuthCredentials();
    return <Navigate to="/landing" replace />;
  }

  
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
