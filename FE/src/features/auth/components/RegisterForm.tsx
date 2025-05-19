// src/pages/auth/RegisterForm.tsx
import React, { useState, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterMutation } from "@/services/auth/registerMutation";
import { RegisterInput } from "@/types/dataTypes";

// Import Card components
import {
  Card,
  CardBorder,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Assuming casing is Card.tsx
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

// Import your FloatingLabelInput component

const RegisterForm: React.FC = () => {
  const { mutate: register, isPending } = useRegisterMutation();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
    phoneNumber: "",
  });

  // --- Handlers ---
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prevData) => ({
        ...prevData,
        address: { ...prevData.address, [addressField]: value },
      }));
    } else if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, ""); // Keep only digits
      setFormData((prevData) => ({ ...prevData, phoneNumber: numericValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg("");
    if (formData.password !== confirmPassword) {
      setErrorMsg("Mật khẩu không khớp."); // Translated
      return;
    }

    const variablesToSend: RegisterInput = {
      ...formData,
      // Only include address object if at least street or city is provided
      address:
        formData.address?.street || formData.address?.city
          ? formData.address
          : undefined,
      // Include phoneNumber only if it's not empty
      phoneNumber: formData.phoneNumber ? formData.phoneNumber : undefined,
    };
    console.log("Submitting registration data:", variablesToSend);
    register(
      { variables: variablesToSend },
      {
        onSuccess: (response: any) => {
          console.log("Registration successful:", response);
          // Consider redirecting to login or showing a success message before home
          navigate("/");
        },
        onError: (error: any) => {
          console.error("Registration Mutation Error:", error);
          const message =
            error?.message || "Đăng ký thất bại. Vui lòng thử lại."; // Translated
          setErrorMsg(message);
        },
      }
    );
  };
  // --- End handlers ---

  // --- Styling Constants Removed ---
  // const inputClassName = ...;
  // const labelClassName = ...;
  // const fieldsetLabelClassName = ...;

  // Define consistent dark mode background for inputs if needed
  const inputDarkBg = "dark:bg-gray-950"; // Match Card dark bg

  return (
    // Centering container - Ensure it allows scrolling on smaller screens if form is long
    <div className="flex items-center justify-center min-h-screen py-10 px-4 bg-gray-100 dark:bg-gray-950">
      {/* Use CardBorder and Card structure */}
      <CardBorder className="w-full max-w-lg">
        {" "}
        {/* Increased max-width slightly */}
        <Card className="relative h-auto bg-white dark:bg-gray-950">
          {" "}
          {/* Adjusted bg */}
          {/* Background blur elements */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -top-40 -left-40 h-[350px] w-[350px] bg-[radial-gradient(circle,var(--color-ch-blue-100)_0%,transparent_70%)] blur-[80px] -z-0 dark:opacity-30"
          ></div>
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-40 h-[350px] w-[350px] bg-[radial-gradient(circle,var(--color-ch-red-100)_2%,transparent_50%)] blur-[80px] -z-0 dark:opacity-30"
          ></div>
          <form
            onSubmit={handleSubmit}
            className="relative z-10 rounded-lg bg-gray-50" // Make form transparent to see Card bg
          >
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                {" "}
                {/* Adjusted text color */}
                Đăng ký tài khoản {/* Translated */}
              </CardTitle>
              {errorMsg && (
                <p className="text-sm text-center font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700 !mt-4">
                  {errorMsg}
                </p>
              )}
            </CardHeader>

            {/* Adjust spacing as needed */}
            <CardContent className="space-y-5">
              {/* --- Name --- */}
              <FloatingLabelInput
                id="name"
                label="Họ và Tên" // Translated
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className={inputDarkBg}
              />

              {/* --- Email --- */}
              <FloatingLabelInput
                id="email"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className={inputDarkBg}
              />

              {/* --- Password & Confirm Password (Grid) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingLabelInput
                  id="password"
                  label="Mật khẩu" // Translated
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={inputDarkBg}
                />
                <FloatingLabelInput
                  id="confirmPassword"
                  label="Xác nhận Mật khẩu" // Translated
                  name="confirmPassword" // Name is important but value/onChange are custom
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} // Use specific handler
                  required
                  autoComplete="new-password"
                  className={inputDarkBg}
                />
              </div>

              {/* --- Address Fieldset --- */}
              <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md px-4 pt-3 pb-4 relative mt-2">
                {" "}
                {/* Adjusted padding */}
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1 absolute -top-2.5 left-2 bg-white dark:bg-gray-950">
                  {" "}
                  {/* Adjusted legend styling */}
                  Địa chỉ (Không bắt buộc) {/* Translated */}
                </legend>
                {/* Use space-y for internal spacing */}
                <div className="space-y-4 mt-2">
                  <FloatingLabelInput
                    id="address.street"
                    label="Địa chỉ cụ thể" // Translated
                    name="address.street"
                    type="text"
                    value={formData.address?.street || ""}
                    onChange={handleChange}
                    autoComplete="street-address"
                    className={inputDarkBg}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="address.city"
                      label="Thành phố" // Translated
                      name="address.city"
                      type="text"
                      value={formData.address?.city || ""}
                      onChange={handleChange}
                      autoComplete="address-level2"
                      className={inputDarkBg}
                    />
                    <FloatingLabelInput
                      id="address.state"
                      label="Tỉnh / Khu vực" // Translated
                      name="address.state"
                      type="text"
                      value={formData.address?.state || ""}
                      onChange={handleChange}
                      autoComplete="address-level1"
                      className={inputDarkBg}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="address.zipCode"
                      label="Mã bưu chính (Zip)" // Translated
                      name="address.zipCode"
                      type="text"
                      value={formData.address?.zipCode || ""}
                      onChange={handleChange}
                      autoComplete="postal-code"
                      className={inputDarkBg}
                    />
                    <FloatingLabelInput
                      id="address.country"
                      label="Quốc gia" // Translated
                      name="address.country"
                      type="text"
                      value={formData.address?.country || ""}
                      onChange={handleChange}
                      autoComplete="country-name"
                      className={inputDarkBg}
                    />
                  </div>
                </div>
              </fieldset>

              {/* --- Phone Number --- */}
              <FloatingLabelInput
                id="phoneNumber"
                label="Số điện thoại (Không bắt buộc)" // Translated
                name="phoneNumber"
                type="tel" // Use type="tel" for phone numbers
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                autoComplete="tel"
                maxLength={11} // Keep maxLength if desired
                className={inputDarkBg}
                // Add pattern if specific format is needed, e.g., pattern="[0-9]{10,11}"
              />
            </CardContent>

            <CardFooter className="flex flex-col pt-5">
              {" "}
              {/* Adjust padding */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-ch-blue text-white py-2.5 rounded-md font-semibold hover:bg-ch-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue focus:ring-offset-white dark:focus:ring-offset-gray-950 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "Đang đăng ký..." : "Đăng ký tài khoản"}{" "}
                {/* Translated */}
              </button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4">
                {" "}
                {/* Adjusted text color */}
                Đã có tài khoản? {/* Translated */}
                <Link
                  to="/login"
                  className="font-medium text-ch-blue hover:underline dark:text-ch-blue-light"
                >
                  {" "}
                  Đăng nhập tại đây {/* Translated */}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </CardBorder>
    </div>
  );
};

export default RegisterForm;
