import { LoginInput } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";
import OUser from "@/repositories/auth.ts"

export interface IUserLoginVariables{
    variables: LoginInput,
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: ({ variables }: IUserLoginVariables) =>
      OUser.login(API_ENDPOINTS.LOGIN, variables),
    onError: (error: any) => {
      // Log the full error for debugging
      console.error("Login error: ", error);
    },
  });
};
