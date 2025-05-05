import { API_ENDPOINTS } from "@/utils/api/endpoint";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import usersRepository from "@/repositories/admin/userManagement.ts"; // Đổi tên import nếu cần
import { User } from "@/types/dataTypes";

export const useUsersQuery = (options?: any): UseQueryResult<User[], Error> => {
  return useQuery<User[], Error>({
    queryKey: ["users"], // Giữ queryKey là 'users' vẫn ổn
    queryFn: () => {
      // SỬA LỖI: Sử dụng đúng endpoint ADMIN_USERS
      const usersList = usersRepository.getAllUsers(API_ENDPOINTS.ADMIN_USERS);
      // console.log("usersList", usersList); // Có thể bỏ console.log
      return usersList;
    },
    // Giữ lại các options khác nếu cần
    // refetchOnMount: true, // Mặc định của React Query thường là true
    // refetchOnReconnect: true, // Mặc định của React Query thường là true
    ...options,
  });
};
