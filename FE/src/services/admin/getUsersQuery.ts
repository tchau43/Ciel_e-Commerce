import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import users from "@/repositories/admin/userManagement.ts";
import { User } from "@/types/dataTypes";

export const useUsersQuery = (options?: any): UseQueryResult<User[], Error>   => {
  return useQuery<User[],Error> ({
// export const useUsersQuery = (options?: any) => {
//   return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      const usersList = users.getAllUsers(API_ENDPOINTS.USERS)
      console.log("usersList", usersList)
      return usersList},
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...options,
  });
};
