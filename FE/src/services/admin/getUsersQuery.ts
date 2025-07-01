import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import usersRepository from "@/repositories/admin/userManagement.ts"; //
import { User } from "@/types/dataTypes";

export const useUsersQuery = (options?: any): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error>({
    queryKey: ["users"], 
    queryFn: () => {
      
      const usersList = usersRepository.getAllUsers(API_ENDPOINTS.ADMIN_USERS);
      // console.log("usersList", usersList); 
      return usersList;
    },
    
    // refetchOnMount: true, // Mặc định của React Query thường là true
    // refetchOnReconnect: true, // Mặc định của React Query thường là true
    ...options,
  });
};
