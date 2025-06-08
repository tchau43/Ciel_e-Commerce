import { RegisterInput } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import Auth from "@/repositories/auth";

interface RegisterVariables {
  variables: RegisterInput;
}

export const useRegisterMutation = () => {
  return useMutation<any, Error, RegisterVariables>({
    mutationFn: ({ variables }) =>
      Auth.register(API_ENDPOINTS.REGISTER, variables),
    onError: (error) => {
      console.error("Register error:", error);
    },
  });
};
