import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types/dataTypes";

interface UserEditContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

const UserEditContext = createContext<UserEditContextType | undefined>(
  undefined
);

export const useUserEdit = () => {
  const context = useContext(UserEditContext);
  if (!context) {
    throw new Error("useUserEdit must be used within a UserEditProvider");
  }
  return context;
};

export const UserEditProvider = ({ children }: { children: ReactNode }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <UserEditContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </UserEditContext.Provider>
  );
};
