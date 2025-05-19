import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthCredentials } from "../../utils/authUtil";
import { Role } from "../../types/dataTypes";
import Header from "./components/Header"; // Verify this path

const AdminLayout: React.FC = () => {
  const { token, role } = getAuthCredentials();

  if (!token || role !== Role.ADMIN) {
    // Consider redirecting to a specific 'unauthorized' page
    // or showing a message before redirecting
    return <Navigate to="/login" replace />;
  }

  return (
    // The outer div controls the overall background potentially
    // Or you can let the Header/Main content handle their own backgrounds
    <div className="flex flex-col min-h-screen w-full bg-background dark:bg-background">
      <Header />
      {/* Main content area */}
      {/* Using `pt-4` instead of `p-4` if header height is fixed and you want padding only below it */}
      {/* bg-muted/40 provides a slight contrast */}
      <main className="flex-1 w-full bg-muted/40 dark:bg-card/20">
        <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 h-full">
          <Outlet />
        </div>
      </main>
      {/* Optional Footer */}
      {/* <footer className="w-full border-t border-border/40 py-4 text-center text-sm text-muted-foreground">
          Admin Footer © {new Date().getFullYear()}
      </footer> */}
    </div>
  );
};

export default AdminLayout;
