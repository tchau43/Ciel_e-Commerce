import OUser from "@/repositories/user/user";
import { User } from "@/types/dataTypes";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetUserQuery = (id: string): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: ["userId"],
    queryFn: () => {
      return OUser.getUserById(API_ENDPOINTS.USER(id));
    },
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};
