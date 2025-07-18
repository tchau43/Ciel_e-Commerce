import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { User } from "@/types/dataTypes";
import OUser from "@/repositories/user/user";

export const useCurrentUserQuery = (
  userId: string
): UseQueryResult<User, Error> => {
  return useQuery<User, Error, User>({
    queryKey: ["currentUser", userId],
    queryFn: async (): Promise<User> => {
      return OUser.getUserById(API_ENDPOINTS.USER_BY_ID(userId));
    },
    refetchOnWindowFocus: false,
  });
};
