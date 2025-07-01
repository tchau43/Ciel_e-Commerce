import { LoginInput, LoginResponse } from "@/types/dataTypes"; 
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query"; 
import Auth from "@/repositories/auth";

interface LoginVariables {
  variables: LoginInput;
}

export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: ({ variables }) => Auth.login(API_ENDPOINTS.LOGIN, variables),
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};
