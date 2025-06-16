import OUser from "@/repositories/user/user.ts";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useMutation } from "@tanstack/react-query";

interface UpdateUserProfileData {
  name?: string;
  phoneNumber?: number;
  address?: string | { street: string };
}

// For user self-profile updates
export const useUpdateUserProfileMutation = () => {
  return useMutation({
    mutationFn: (variables: UpdateUserProfileData) => {
      return OUser.updateProfile(API_ENDPOINTS.USER_PROFILE_UPDATE, variables);
    },
  });
};
