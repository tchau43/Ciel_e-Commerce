import OUser from "@/repositories/user/user.ts";
import { User } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

export const useUpdateUserByIdMutation = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: User }) => {
      return OUser.updateUserById(API_ENDPOINTS.UPDATE_USER(id), variables); // ✅ Correct API call
    },
  });
};
