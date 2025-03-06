import { UserEditProvider } from "@/components/context/UserEditContext";
import UserManagementTable from "@/components/layout/admin/mangement/UserManagementTable";
import { useUsersQuery } from "@/services/admin/getUsersQuery";
import { useState } from "react";

const AdminUserManagementPage: React.FC = () => {
  const [trigger, setTrigger] = useState(0);
  const {
    data = [],
    error,
    isLoading,
  } = useUsersQuery({
    refetchOnWindowFocus: false,
  });
  console.log("data", data);
  if (isLoading)
    return <p className="text-center text-gray-600">Loading user data...</p>;

  // Now TypeScript knows that `data` is a `User[]`
  return (
    <>
      <UserManagementTable data={data!} triggerRefresh={setTrigger} />
    </>
  );
};

export default AdminUserManagementPage;
