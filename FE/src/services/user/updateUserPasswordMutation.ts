import { useMutation } from "@tanstack/react-query";
import userRepository from "@/repositories/user/user";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

interface UpdateUserPasswordVariables {
  oldPassword: string;
  newPassword: string;
}

interface UpdatePasswordResponse {
  message: string;
}

export const useUpdateUserPasswordMutation = () => {
  return useMutation<
    UpdatePasswordResponse,
    Error,
    UpdateUserPasswordVariables
  >({
    mutationFn: (variables: UpdateUserPasswordVariables) => {
      return userRepository.updateUserPassword(
        API_ENDPOINTS.USER_CHANGE_PASSWORD,
        variables
      );
    },
  });
};
