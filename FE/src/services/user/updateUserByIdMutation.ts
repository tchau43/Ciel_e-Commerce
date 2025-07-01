import OUser from "@/repositories/user/user.ts";
import { User, Address } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

interface UpdateUserProfileData {
  name?: string;
  phoneNumber?: number;
  address?: Address;
}

export const useUpdateUserByIdMutation = () => {
  return useMutation({
    mutationFn: ({ id, variables }: { id: string; variables: User }) => {
      return OUser.updateUserById(
        API_ENDPOINTS.ADMIN_UPDATE_USER(id),
        variables
      );
    },
  });
};

export const useUpdateUserProfileMutation = () => {
  return useMutation({
    mutationFn: (variables: UpdateUserProfileData) => {
      return OUser.updateProfile(API_ENDPOINTS.USER_PROFILE_UPDATE, variables);
    },
  });
};
