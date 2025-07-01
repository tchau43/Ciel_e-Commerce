//
import { LoginInput, LoginResponse } from "@/types/dataTypes"; 
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation, UseMutationResult } from "@tanstack/react-query"; 
import OUser from "@/repositories/auth.ts";

export interface IUserLoginVariables {
  variables: LoginInput;
}


export const useLoginMutation = (): UseMutationResult<
  LoginResponse,
  Error,
  IUserLoginVariables
> => {
  return useMutation<LoginResponse, Error, IUserLoginVariables>({
    
    mutationFn: (
      { variables }: IUserLoginVariables 
    ) => OUser.login(API_ENDPOINTS.LOGIN, variables),
    onError: (error: any) => {
      console.error("Login error: ", error);
    },
    
  });
};
