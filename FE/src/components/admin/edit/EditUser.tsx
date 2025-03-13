import { useParams } from "react-router-dom";
import UserUpdateForm from "@/components/admin/form/UserUpdateForm";
import { useGetUserQuery } from "@/services/user/getUserQuery";

const EditUser: React.FC = () => {
  const { id } = useParams(); // Get user ID from URL
  const { data: user, error, isLoading } = useGetUserQuery(id!);
  //   console.log("data", user);
  if (isLoading)
    return <p className="text-center text-gray-600">Loading user data...</p>;

  if (error) {
    console.error("Error fetching user:", error);
    return (
      <p className="text-center text-red-600">
        Error loading user. Please try again.
      </p>
    );
  }

  if (!user) {
    return <p className="text-center text-gray-600">User not found.</p>;
  }

  return (
    <>
      <UserUpdateForm user={user!} />
    </>
  );
};

export default EditUser;
