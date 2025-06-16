import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { User } from "@/types/dataTypes";
import OUser from "@/repositories/user/user";

export const useCurrentUserQuery = (
  userId: string
): UseQueryResult<User, Error> => {
  return useQuery<User, Error>({
    queryKey: ["currentUser", userId],
    queryFn: async () => {
      return OUser.getUserById(API_ENDPOINTS.USER_BY_ID(userId));
    },
    // Không fetch lại khi focus window vì đã có token trong localStorage
    refetchOnWindowFocus: false,
  });
};
