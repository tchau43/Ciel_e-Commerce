// src/pages/admin/AdminUserManagementPage.tsx
// LƯU Ý: Đảm bảo tên file không có khoảng trắng ở cuối (".tsx" thay vì ".tsx ")

import React from "react"; // Import React
// import { UserEditProvider } from "@/components/context/UserEditContext"; // XÓA: Import không sử dụng
import UserManagementTable from "@/features/admin/components/UserManagementTable";
import { useUsersQuery } from "@/services/admin/getUsersQuery";
// import { useState } from "react"; // XÓA: useState không sử dụng

const AdminUserManagementPage: React.FC = () => {
  // const [trigger, setTrigger] = useState(0); // XÓA: State không sử dụng
  const {
    data = [],
    error, // Giữ lại error để xử lý
    isLoading,
  } = useUsersQuery({
    refetchOnWindowFocus: false, // Giữ lại option nếu cần
  });

  if (isLoading) {
    return (
      <p className="text-center text-gray-600 p-10">
        Đang tải dữ liệu người dùng...
      </p>
    );
  }

  // Xử lý lỗi
  if (error) {
    return (
      <p className="text-center text-red-600 p-10">
        Lỗi tải dữ liệu: {error.message || "Lỗi không xác định"}
      </p>
    );
  }

  return (
    <>
      {/* Truyền data trực tiếp, không cần ! vì đã có giá trị mặc định là [] */}
      <UserManagementTable data={data} />
    </>
  );
};

export default AdminUserManagementPage;
