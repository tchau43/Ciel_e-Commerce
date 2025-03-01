import { useMutation } from "@tanstack/react-query";
import OUserManagement from "@/repositories/admin/userManagement.ts";
import { error } from "console";
import { API_ENDPOINTS } from "@/utils/api/endpoint";

export const usemanageUserMutation = () => {
  return useMutation({
    mutationFn: () => {
      return OUserManagement.getAllUsers(API_ENDPOINTS.USERS);
    },
    onError: (error) => {
      console.log(error);
    },
  });
};
