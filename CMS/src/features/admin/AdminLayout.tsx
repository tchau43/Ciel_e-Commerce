import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthCredentials } from "../../utils/authUtil";
import { Role } from "../../types/dataTypes";
import Header from "./components/Header";

const AdminLayout: React.FC = () => {
  const { token, role } = getAuthCredentials();

  if (!token || role !== Role.ADMIN) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background dark:bg-background">
      <Header />
      <main className="flex-1 w-full bg-muted/40 dark:bg-card/20">
        <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
