import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/services/auth/loginMutation";
import {
  LoginInput,
  Role,
  LoginResponse,
  UserReference,
} from "@/types/dataTypes";
import { setAuthCredentials } from "@/utils/authUtil";
import {
  Card,
  CardBorder,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

const LoginForm: React.FC = () => {
  const { mutate: login, isPending } = useLoginMutation();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    login(
      { variables: formData },
      {
        onSuccess: (response: LoginResponse) => {
          console.log("Login Response:", response);
          const { EC, accessToken, user } = response;

          if (EC === 0 && accessToken && user) {
            if (user.role !== Role.ADMIN) {
              setErrorMsg("Tài khoản hoặc mật khẩu không đúng");
              setFormData({
                email: "",
                password: "",
              });
              return;
            }

            const userInfoToStore: UserReference = {
              _id: user._id,
              name: user.name,
              email: user.email,
              image: user.image,
              address: user.address,
            };
            const role: Role = user.role;
            setAuthCredentials(accessToken, role, userInfoToStore);
            navigate("/");
          } else {
            setErrorMsg(response.message || "Đăng nhập thất bại.");
            setFormData({
              email: "",
              password: "",
            });
          }
        },
        onError: (error: any) => {
          console.error("Login Mutation Error:", error);
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Đã xảy ra lỗi.";
          setErrorMsg(message);
          setFormData({
            email: "",
            password: "",
          });
        },
      }
    );
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-950">
      <CardBorder className="w-full max-w-md">
        <Card className="relative h-auto bg-white dark:bg-gray-950">
          <div
            aria-hidden="true"
            className="absolute inset-0 -top-40 -left-40 h-[350px] w-[350px] bg-[radial-gradient(circle,var(--color-ch-blue-100)_0%,transparent_70%)] blur-[80px] -z-0 dark:opacity-30"
          ></div>
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -right-40 h-[350px] w-[350px] bg-[radial-gradient(circle,var(--color-ch-pink-100)_2%,transparent_50%)] blur-[80px] -z-0 dark:opacity-30"
          ></div>
          <form
            onSubmit={handleSubmit}
            className="relative z-10 rounded-lg bg-gray-50"
          >
            <CardHeader>
              <CardTitle className="text-center text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                Đăng nhập
              </CardTitle>
              {errorMsg && (
                <p className="text-sm text-center font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700 !mt-4">
                  {errorMsg}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <FloatingLabelInput
                id="email"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="dark:bg-gray-950"
              />
              <FloatingLabelInput
                id="password"
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="dark:bg-gray-950"
              />
            </CardContent>

            <CardFooter className="flex flex-col pt-5">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-ch-blue text-white py-2.5 rounded-md font-semibold hover:bg-ch-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ch-blue focus:ring-offset-white dark:focus:ring-offset-gray-950 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "Đang đăng nhập ..." : "Đăng nhập"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </CardBorder>
    </div>
  );
};

export default LoginForm;
