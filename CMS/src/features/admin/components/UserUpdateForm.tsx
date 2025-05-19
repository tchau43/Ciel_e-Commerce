import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/dataTypes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react"; // Importing a loading icon
import { useUpdateUserByIdMutation } from "@/services/user/updateUserByIdMutation";

interface UserUpdateFormProps {
  user: User;
}

const UserUpdateForm: React.FC<UserUpdateFormProps> = ({ user }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  console.log("formData", formData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { mutate: updateUser, isPending } = useUpdateUserByIdMutation();
  const navigate = useNavigate();
  useEffect(() => {
    setFormData({ ...user });
  }, [user]);
  if (isPending)
    return <p className="text-center text-gray-600">Loading users data...</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({
      ...prev,
      status: !prev.status,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    updateUser(
      { id: formData._id.toString(), variables: formData },
      {
        onSuccess: (response) => {
          console.log(response);
          setMessage("Update User Successfully!");
          setTimeout(() => {
            navigate("/users"), 1500;
          });
        },
        onError: (error) => {
          console.log(error);
          //   const message =
          //     error?.response?.data?.message || "login.error.default";
          //   setErrorMsg(message);
        },
      }
    );
  };

  return (
    <Card className="p-6 max-w-lg mx-auto mt-10 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Update User</h2>

      {message && (
        <div
          className={`p-2 rounded-md mb-4 text-white ${
            message.includes("Error") ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Enter name"
          />
        </div>

        {/* Email Input (Disabled) */}
        <div>
          <label className="block text-sm font-medium">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium">Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="ADMIN">Admin</option>
            <option value="CUSTOMER">Customer</option>
            <option value="MODERATOR">Moderator</option>
          </select>
        </div>

        {/* Status Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleCheckboxChange}
            className="w-5 h-5"
          />
          <label className="text-sm">Active User</label>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate("/users")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserUpdateForm;
