// src/services/auth/loginMutation.ts (Updated)
import { LoginInput, LoginResponse } from "@/types/dataTypes"; // Import LoginResponse
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, UseMutationResult } from "@tanstack/react-query"; // Import UseMutationResult
import OUser from "@/repositories/auth.ts";

export interface IUserLoginVariables {
  variables: LoginInput;
}

// Explicitly type the mutation hook's result and error types
export const useLoginMutation = (): UseMutationResult<
  LoginResponse,
  Error,
  IUserLoginVariables
> => {
  return useMutation<LoginResponse, Error, IUserLoginVariables>({
    // Add types here
    mutationFn: (
      { variables }: IUserLoginVariables // Type the promise
    ) => OUser.login(API_ENDPOINTS.LOGIN, variables),
    onError: (error: any) => {
      console.error("Login error: ", error);
    },
    // onSuccess can be defined here or in the component where useLoginMutation is called
  });
};
