import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import userRepository from "@/repositories/user/user";
import { Address } from "@/types/dataTypes";

interface UpdateUserData {
  id: string;
  name?: string;
  status?: boolean;
  role?: string;
  address?: Address;
  phoneNumber?: string;
  oldPassword?: string;
  newPassword?: string;
}

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserData) =>
      userRepository.updateUser(API_ENDPOINTS.UPDATE_USER(id), data),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
