import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/services/auth/loginMutation";
import { useRegisterMutation } from "@/services/auth/registerMutation";
import { LoginInput, RegisterInput, Role } from "@/types/dataTypes";
import { setAuthCredentials } from "@/utils/authUtil";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

const defaultAddress = {
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { mutate: login, isPending: isLoginPending } = useLoginMutation();
  const { mutate: register, isPending: isRegisterPending } =
    useRegisterMutation();

  const [loginData, setLoginData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
    address: defaultAddress,
    phoneNumber: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setRegisterData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, "");
      setRegisterData((prev) => ({ ...prev, phoneNumber: numericValue }));
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    login(
      { variables: loginData },
      {
        onSuccess: (response) => {
          const { EC, accessToken, user } = response;

          if (EC === 0 && accessToken && user) {
            if (user.role !== Role.CUSTOMER) {
              setErrorMsg("Tài khoản hoặc mật khẩu không đúng");
              setLoginData({
                email: "",
                password: "",
              });
              return;
            }

            const userInfoToStore = {
              _id: user._id,
              name: user.name,
              email: user.email,
              image: user.image,
              address: user.address,
            };
            setAuthCredentials(accessToken, user.role, userInfoToStore);
            navigate("/");
          } else {
            setErrorMsg(response.message || "Đăng nhập thất bại.");
            setLoginData({
              email: "",
              password: "",
            });
          }
        },
        onError: (error: any) => {
          const message =
            error?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
          setErrorMsg(message);
          setLoginData({
            email: "",
            password: "",
          });
        },
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (registerData.password !== confirmPassword) {
      setErrorMsg("Mật khẩu không khớp.");
      return;
    }

    const variablesToSend: RegisterInput = {
      ...registerData,
      address:
        registerData.address!.street || registerData.address!.city
          ? registerData.address
          : undefined,
      phoneNumber: registerData.phoneNumber || undefined,
    };

    register(
      { variables: variablesToSend },
      {
        onSuccess: (response: any) => {
          setIsActive(false);
          setErrorMsg(
            response.message || "Đăng ký thành công! Vui lòng đăng nhập."
          );
        },
        onError: (error: any) => {
          const message =
            error?.message || "Đăng ký thất bại. Vui lòng thử lại.";
          setErrorMsg(message);
        },
      }
    );
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] p-5 w-[1000px] mx-auto">
      <div
        className={`relative w-[850px] h-[550px] bg-white m-5 rounded-[30px] shadow-2xl overflow-hidden
                    sm:h-[calc(100vh-40px)] sm:w-full
                    transition-all duration-500 ease-in-out ${
                      isActive ? "active-state" : ""
                    }`}
      >
        {/* Login Form */}
        <div
          className={`form-box-common login-form absolute right-0 w-1/2 h-full bg-white flex items-center text-center text-gray-700 p-10 z-[1]
                      transition-all duration-600 ease-in-out delay-[1200ms]
                      sm:w-full sm:h-[70%] sm:bottom-0 sm:delay-0
                      ${
                        isActive
                          ? "right-1/2 sm:right-0 sm:bottom-[30%]"
                          : "right-0 sm:right-0 sm:bottom-0"
                      }`}
        >
          <form onSubmit={handleLoginSubmit} className="w-full">
            <h1 className="text-4xl font-bold my-[-10px] mb-4">Đăng nhập</h1>
            {errorMsg && !isActive && (
              <p className="text-sm text-center font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700 mb-4">
                {errorMsg}
              </p>
            )}
            <div className="space-y-4">
              <FloatingLabelInput
                id="login-email"
                label="Email"
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
                autoComplete="email"
              />
              <FloatingLabelInput
                id="login-password"
                label="Mật khẩu"
                name="password"
                type="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoginPending}
              className="w-full h-12 mt-6 bg-[#7494ec] rounded-lg shadow-md border-none cursor-pointer text-base text-white font-semibold hover:bg-[#5f7edb] transition-colors disabled:opacity-50"
            >
              {isLoginPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        {/* Register Form */}
        <div
          className={`form-box-common register-form absolute right-0 w-1/2 h-full bg-white flex items-center text-center text-gray-700 p-10 z-[1]
                      transition-all duration-600 ease-in-out delay-[0ms] ${
                        isActive ? "delay-[1200ms]" : ""
                      }
                      sm:w-full sm:h-[70%] sm:bottom-0 sm:delay-0
                      ${
                        isActive
                          ? "right-0 sm:right-0 sm:bottom-[30%] visible"
                          : "right-[-50%] sm:right-0 sm:bottom-[-70%] invisible"
                      }
                      ${
                        isActive ? "opacity-100 visible" : "opacity-0 invisible"
                      }`}
        >
          <form
            onSubmit={handleRegisterSubmit}
            className="w-full overflow-y-auto max-h-full"
          >
            <h1 className="text-4xl font-bold my-[-10px] mb-4">Đăng ký</h1>
            {errorMsg && isActive && (
              <p className="text-sm text-center font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md border border-red-300 dark:border-red-700 mb-4">
                {errorMsg}
              </p>
            )}
            <div className="space-y-4">
              <FloatingLabelInput
                id="register-name"
                label="Họ và Tên"
                name="name"
                type="text"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
                autoComplete="name"
              />
              <FloatingLabelInput
                id="register-email"
                label="Email"
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                autoComplete="email"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingLabelInput
                  id="register-password"
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="new-password"
                />
                <FloatingLabelInput
                  id="register-confirm-password"
                  label="Xác nhận Mật khẩu"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <FloatingLabelInput
                id="register-phone"
                label="Số điện thoại (Không bắt buộc)"
                name="phoneNumber"
                type="tel"
                value={registerData.phoneNumber}
                onChange={handleRegisterChange}
                autoComplete="tel"
              />
              <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md px-4 pt-3 pb-4 relative">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">
                  Địa chỉ (Không bắt buộc)
                </legend>
                <div className="space-y-4">
                  <FloatingLabelInput
                    id="address-street"
                    label="Địa chỉ cụ thể"
                    name="address.street"
                    type="text"
                    value={registerData.address!.street}
                    onChange={handleRegisterChange}
                    autoComplete="street-address"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="address-city"
                      label="Thành phố"
                      name="address.city"
                      type="text"
                      value={registerData.address!.city}
                      onChange={handleRegisterChange}
                      autoComplete="address-level2"
                    />
                    <FloatingLabelInput
                      id="address-state"
                      label="Tỉnh / Khu vực"
                      name="address.state"
                      type="text"
                      value={registerData.address!.state}
                      onChange={handleRegisterChange}
                      autoComplete="address-level1"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      id="address-country"
                      label="Quốc gia"
                      name="address.country"
                      type="text"
                      value={registerData.address!.country}
                      onChange={handleRegisterChange}
                      autoComplete="country-name"
                    />
                    <FloatingLabelInput
                      id="address-zipcode"
                      label="Mã bưu chính"
                      name="address.zipCode"
                      type="text"
                      value={registerData.address!.zipCode}
                      onChange={handleRegisterChange}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
            <button
              type="submit"
              disabled={isRegisterPending}
              className="w-full h-12 mt-6 bg-[#7494ec] rounded-lg shadow-md border-none cursor-pointer text-base text-white font-semibold hover:bg-[#5f7edb] transition-colors disabled:opacity-50"
            >
              {isRegisterPending ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>
        </div>

        {/* Toggle Box */}
        <div className="toggle-box absolute w-full h-full">
          <div
            className={`absolute top-0 h-full w-[300%] bg-[#7494ec] rounded-[150px] z-[2]
                        transition-all duration-[1800ms] ease-in-out
                        sm:w-full sm:h-[300%] sm:rounded-[20vw]
                        ${
                          isActive
                            ? "left-1/2 sm:left-0 sm:top-[70%]"
                            : "left-[-250%] sm:left-0 sm:top-[-270%]"
                        }`}
          />

          {/* Toggle Panel Left */}
          <div
            className={`absolute w-1/2 h-full text-white flex flex-col justify-center items-center z-[2]
                        transition-all duration-600 ease-in-out
                        sm:w-full sm:h-[30%]
                        ${
                          isActive
                            ? "left-[-50%] delay-600 sm:left-0 sm:top-[-30%]"
                            : "left-0 delay-[1200ms] sm:left-0 sm:top-0"
                        }`}
          >
            <h1 className="text-4xl font-bold mb-2 sm:text-3xl">Xin chào!</h1>
            <p className="text-sm mb-5">Chưa có tài khoản?</p>
            <button
              onClick={() => {
                setIsActive(true);
                setErrorMsg("");
              }}
              className="w-40 h-[46px] bg-transparent border-2 border-white rounded-lg text-base text-white font-semibold cursor-pointer hover:bg-white hover:text-[#7494ec] transition-colors"
            >
              Đăng ký
            </button>
          </div>

          {/* Toggle Panel Right */}
          <div
            className={`absolute w-1/2 h-full text-white flex flex-col justify-center items-center z-[2]
                        transition-all duration-600 ease-in-out
                        sm:w-full sm:h-[30%]
                        ${
                          isActive
                            ? "right-0 delay-[1200ms] sm:right-0 sm:bottom-0"
                            : "right-[-50%] delay-600 sm:right-0 sm:bottom-[-30%]"
                        }`}
          >
            <h1 className="text-4xl font-bold mb-2 sm:text-3xl">
              Chào mừng trở lại!
            </h1>
            <p className="text-sm mb-5">Đã có tài khoản?</p>
            <button
              onClick={() => {
                setIsActive(false);
                setErrorMsg("");
              }}
              className="w-40 h-[46px] bg-transparent border-2 border-white rounded-lg text-base text-white font-semibold cursor-pointer hover:bg-white hover:text-[#7494ec] transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
