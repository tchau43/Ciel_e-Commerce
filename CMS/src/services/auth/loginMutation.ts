// src/services/auth/loginMutation.ts (Updated)
import { LoginInput, LoginResponse } from "@/types/dataTypes"; // Import LoginResponse
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query"; // Import UseMutationResult
import Auth from "@/repositories/auth";

interface LoginVariables {
  variables: LoginInput;
}

// Explicitly type the mutation hook's result and error types
export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: ({ variables }) => Auth.login(API_ENDPOINTS.LOGIN, variables),
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};
