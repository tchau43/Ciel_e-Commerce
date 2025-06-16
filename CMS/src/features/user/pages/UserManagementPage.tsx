// src/pages/admin/UserManagementPage.tsx
// LƯU Ý: Đảm bảo tên file không có khoảng trắng ở cuối (".tsx" thay vì ".tsx ")

import React, { useState } from "react";
import { useUsersQuery } from "@/services/admin/getUsersQuery";
import UserManagementTable from "../components/UserManagementTable";
import { AlertCircle, Search, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const UserManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data = [],
    error,
    isLoading,
  } = useUsersQuery({
    refetchOnWindowFocus: false,
  });

  // Filter users based on search term
  const filteredUsers = data.filter((user) =>
    Object.values({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      role: user.role.toLowerCase(),
    }).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground/70 dark:text-muted-foreground/60 animate-pulse">
          Đang tải dữ liệu người dùng...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="mt-4 bg-destructive/10 dark:bg-destructive/20 border-destructive/20 dark:border-destructive/30"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-destructive-foreground/90 dark:text-destructive-foreground/80">
          Lỗi
        </AlertTitle>
        <AlertDescription className="text-destructive-foreground/80 dark:text-destructive-foreground/70">
          Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background/50 dark:bg-background/30">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground/90 dark:text-foreground/80">
          Quản lý Người dùng
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 dark:text-muted-foreground/60" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10 text-foreground/90 dark:text-foreground/80 placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40"
            />
          </div>
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              /* Handle add user */
            }}
          >
            <Plus className="h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-foreground/90 dark:text-foreground/80">
            Danh sách người dùng
          </h2>
          <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
            Tổng cộng: {filteredUsers.length} người dùng
            {searchTerm && ` (đang lọc theo: "${searchTerm}")`}
          </p>
        </div>
      </div>
      <UserManagementTable data={filteredUsers} />
    </div>
  );
};

export default UserManagementPage;
