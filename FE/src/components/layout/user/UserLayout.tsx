import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthCredentials } from "../../../utils/authUtil";
import Header from "./header/Header";
import { Role } from "../../../types/dataTypes";

const UserLayout: React.FC = () => {
  const { token, role } = getAuthCredentials();

  if (!token || role !== Role.USER) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-full w-full overflow-x-hidden items-center">
      <Header />
      <div className="p-4 flex bg-primary-foreground w-full flex-1 justify-center items-start">
        <div className="h-full w-full max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
