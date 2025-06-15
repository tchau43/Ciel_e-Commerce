import React, { useState } from "react";
import { getAuthCredentials } from "@/utils/authUtil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useUpdateUserProfileMutation } from "@/services/user/updateUserByIdMutation";
import { useUpdateUserPasswordMutation } from "@/services/user/updateUserPasswordMutation";
import { useCurrentUserQuery } from "@/services/user/getCurrentUserQuery";
import { User, Address } from "@/types/dataTypes";
import axios from "axios";

interface UserProfile {
  name: string;
  email: string;
  phoneNumber?: number;
  address?: Address;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { userInfo } = getAuthCredentials();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(
    null
  );
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updateProfileMutation = useUpdateUserProfileMutation();
  const updatePasswordMutation = useUpdateUserPasswordMutation();
  const { data: userData, isLoading } = useCurrentUserQuery(
    userInfo?._id || ""
  );

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phoneNumber: undefined,
    address: {
      street: "",
      city: "",
      state: "",
      country: "Việt Nam",
      zipCode: "",
    },
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cập nhật form khi có dữ liệu từ API
  React.useEffect(() => {
    if (userData) {
      const newProfile = {
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber,
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          country: userData.address?.country || "Việt Nam",
          zipCode: userData.address?.zipCode || "",
        },
      };
      setProfile(newProfile);
      setOriginalProfile(newProfile);
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      // Chỉ cho phép nhập số
      const numericValue = value.replace(/\D/g, "");
      setProfile((prev) => ({
        ...prev,
        [name]: numericValue ? Number(numericValue) : undefined,
      }));
    } else if (name.startsWith("address.")) {
      // Xử lý các trường địa chỉ
      const addressField = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setOriginalProfile(profile);
  };

  const handleCancelEditing = () => {
    const hasChanges =
      JSON.stringify(profile) !== JSON.stringify(originalProfile);
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleConfirmCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
    setShowCancelConfirm(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo?._id) {
      toast.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    // Validate required fields
    if (!profile.name.trim()) {
      toast.error("Vui lòng nhập họ và tên!");
      return;
    }

    if (!profile.phoneNumber) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }

    // Only validate address fields if any of them has been filled
    const hasAddressData = Boolean(
      profile.address?.street?.trim() ||
        profile.address?.city?.trim() ||
        profile.address?.state?.trim()
    );

    if (hasAddressData && profile.address) {
      if (
        !profile.address.street?.trim() ||
        !profile.address.city?.trim() ||
        !profile.address.state?.trim()
      ) {
        toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ!");
        return;
      }
    }

    try {
      // Gọi mutation để cập nhật thông tin
      const result = await updateProfileMutation.mutateAsync({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        address: profile.address
          ? {
              street: profile.address.street || "",
              city: profile.address.city || "",
              state: profile.address.state || "",
              country: profile.address.country || "Việt Nam",
              zipCode: profile.address.zipCode || "",
            }
          : undefined,
      });

      if (result.user) {
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
        setOriginalProfile(profile);

        // Cập nhật lại thông tin trong localStorage
        const currentAuth = JSON.parse(localStorage.getItem("auth") || "{}");
        localStorage.setItem(
          "auth",
          JSON.stringify({
            ...currentAuth,
            userInfo: { ...userInfo, ...result.user },
          })
        );
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
      console.error("Error updating profile:", error);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo?._id) {
      toast.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    // Validate inputs
    if (!passwordForm.currentPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu hiện tại!");
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    try {
      const result = await updatePasswordMutation.mutateAsync({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.message) {
        toast.success(result.message);
      } else {
        toast.success("Đổi mật khẩu thành công!");
      }

      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Có lỗi xảy ra khi đổi mật khẩu!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Thông tin tài khoản
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled={true} // Email không được phép sửa
                className="mt-1 bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={profile.phoneNumber || ""}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-4">
              <Label>Địa chỉ</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <Label
                    htmlFor="address.street"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Số nhà, Đường
                  </Label>
                  <Input
                    id="address.street"
                    name="address.street"
                    value={profile.address?.street || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Ví dụ: 123 Đường Lê Lợi"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="address.state"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Quận/Huyện
                  </Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={profile.address?.state || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Ví dụ: Quận 1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="address.city"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Tỉnh/Thành phố
                  </Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={profile.address?.city || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="address.country"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Quốc gia
                  </Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={profile.address?.country || "Việt Nam"}
                    onChange={handleInputChange}
                    disabled={true}
                    className="mt-1 bg-gray-100 dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form buttons only shown when editing */}
          {isEditing && (
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEditing}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          )}
        </form>

        {/* Buttons outside the form */}
        {!isEditing && (
          <div className="flex justify-end space-x-4 ">
            <Button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              variant="outline"
            >
              Đổi mật khẩu
            </Button>
            <Button
              type="button"
              onClick={handleStartEditing}
              variant="outline"
            >
              Chỉnh sửa
            </Button>
          </div>
        )}

        {/* Form đổi mật khẩu */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Đổi mật khẩu
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.current ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.new ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="mt-1 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePasswordMutation.isPending}
                  >
                    {updatePasswordMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Đổi mật khẩu
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Popup xác nhận hủy chỉnh sửa */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Xác nhận hủy chỉnh sửa
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu lại.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Tiếp tục chỉnh sửa
                </Button>
                <Button type="button" onClick={handleConfirmCancel}>
                  Xác nhận hủy
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
