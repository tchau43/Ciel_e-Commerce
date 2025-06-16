import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateUserMutation } from "@/services/user/updateUserByIdMutation";
import { User, Address, Role, UpdateUserInput } from "@/types/dataTypes";
import { toast } from "sonner";

interface EditUserFormProps {
  user: User;
  onCancel: () => void;
}

interface FormData {
  name: string;
  status: boolean;
  role: Role;
  phoneNumber: string;
  address: Address;
  oldPassword: string;
  newPassword: string;
}

export default function EditUserForm({ user, onCancel }: EditUserFormProps) {
  const { mutate: updateUser } = useUpdateUserMutation();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: user.name,
    status: user.status,
    role: user.role,
    phoneNumber: user.phoneNumber?.toString() || "",
    address: user.address || {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    oldPassword: "",
    newPassword: "",
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  // Handle address changes
  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Address
  ) => {
    setFormData({
      ...formData,
      address: { ...formData.address, [field]: e.target.value },
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error("Tên không được để trống");
      return;
    }

    // Prepare update data
    const updateData: UpdateUserInput = {
      name: formData.name.trim(),
      status: formData.status,
      role: formData.role,
      phoneNumber: formData.phoneNumber?.trim() || undefined,
      address:
        formData.address &&
        Object.values(formData.address).some((val) => val?.trim())
          ? {
              street: formData.address.street?.trim() || "",
              city: formData.address.city?.trim() || "",
              state: formData.address.state?.trim() || "",
              country: formData.address.country?.trim() || "",
              zipCode: formData.address.zipCode?.trim() || "",
            }
          : undefined,
    };

    // Add password fields if both are provided
    if (formData.oldPassword && formData.newPassword) {
      if (formData.newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }
      updateData.oldPassword = formData.oldPassword;
      updateData.newPassword = formData.newPassword;
    } else if (formData.oldPassword || formData.newPassword) {
      toast.error("Vui lòng nhập cả mật khẩu cũ và mới");
      return;
    }

    // Call update API
    updateUser(
      { id: user._id, ...updateData },
      {
        onSuccess: () => {
          toast.success("Cập nhật thông tin thành công");
          onCancel();
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="name"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Tên
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange(e, "name")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Email
            </Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted/60 dark:bg-muted/40 text-muted-foreground/70"
            />
          </div>

          <div>
            <Label
              htmlFor="phoneNumber"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Số điện thoại
            </Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange(e, "phoneNumber")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>

          <div>
            <Label
              htmlFor="role"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Vai trò
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: Role) =>
                setFormData({ ...formData, role: value })
              }
            >
              <SelectTrigger className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label
              htmlFor="status"
              className="cursor-pointer text-foreground/90 dark:text-foreground/80"
            >
              <input
                type="checkbox"
                id="status"
                className="mr-2 accent-primary/90 dark:accent-primary/80"
                checked={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked })
                }
              />
              Trạng thái hoạt động
            </Label>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="street"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Đường
            </Label>
            <Input
              id="street"
              value={formData.address.street}
              onChange={(e) => handleAddressChange(e, "street")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>

          <div>
            <Label
              htmlFor="city"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Thành phố
            </Label>
            <Input
              id="city"
              value={formData.address.city}
              onChange={(e) => handleAddressChange(e, "city")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>

          <div>
            <Label
              htmlFor="state"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Tỉnh/Thành phố
            </Label>
            <Input
              id="state"
              value={formData.address.state}
              onChange={(e) => handleAddressChange(e, "state")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>

          <div>
            <Label
              htmlFor="country"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Quốc gia
            </Label>
            <Input
              id="country"
              value={formData.address.country}
              onChange={(e) => handleAddressChange(e, "country")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>

          <div>
            <Label
              htmlFor="zipCode"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Mã bưu điện
            </Label>
            <Input
              id="zipCode"
              value={formData.address.zipCode}
              onChange={(e) => handleAddressChange(e, "zipCode")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="border-t border-border/10 dark:border-border/5 pt-4">
        <h3 className="text-lg font-medium mb-4 text-foreground/90 dark:text-foreground/80">
          Đổi mật khẩu (tùy chọn)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="oldPassword"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Mật khẩu cũ
            </Label>
            <Input
              id="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={(e) => handleInputChange(e, "oldPassword")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>
          <div>
            <Label
              htmlFor="newPassword"
              className="text-foreground/90 dark:text-foreground/80"
            >
              Mật khẩu mới
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange(e, "newPassword")}
              className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border/20 dark:border-border/10 hover:bg-muted/80 dark:hover:bg-muted/20"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-primary/90 dark:bg-primary/80 hover:bg-primary/100 dark:hover:bg-primary/90"
        >
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
