import { useRegisterMutation } from "@/services/auth/registerMutation";
import { RegisterInput } from "@/types/dataTypes";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });
  const { mutate: register } = useRegisterMutation();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password !== confirmPassword) {
      setErrorMsg("register.error.passwordMismatch");
      return;
    }

    const handleRegisterSuccess = () => {
      navigate("/");
    };

    register(
      { variables: formData },
      {
        onSuccess: () => {
          handleRegisterSuccess();
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || "register.error.default";
          setErrorMsg(message);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <div className="mb-4">
        <label htmlFor="fullName" className="block text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
