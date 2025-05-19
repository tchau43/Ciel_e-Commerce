import { useMutation } from "@tanstack/react-query";
import OUser from "@/repositories/auth";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { RegisterInput } from "@/types/dataTypes";

export interface IUserRegisterVariables {
  variables: RegisterInput;
}

export const useRegisterMutation = () => {
  return useMutation({
   mutationFn: ({ variables }: IUserRegisterVariables) =>
      OUser.register(API_ENDPOINTS.REGISTER, variables)
});
};
