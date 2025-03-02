import { useLoginMutation } from "@/services/auth/loginMutation";
import { LoginInput, Role } from "@/types/dataTypes";
import { setAuthCredentials } from "@/utils/authUtil";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm: React.FC = () => {
  const { mutate: login } = useLoginMutation();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login(
      { variables: formData },
      {
        onSuccess: (response) => {
          console.log(response);
          const { EC, accessToken, user } = response;

          const userInfo = {
            name: user.name,
            email: user.email,
          };
          const role: Role = user.role || "USER";

          if (EC === 0 && accessToken) {
            setAuthCredentials(accessToken, role, userInfo);
          } else {
            console.log("Login failed");
          }
          console.log("hello ", user.name);
          navigate("/");
        },
        onError: (error) => {
          console.log(error);
          const message =
            error?.response?.data?.message || "login.error.default";
          setErrorMsg(message);
        },
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border-2 border-gray-500 rounded-sm space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <div>
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your name"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Your name"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
