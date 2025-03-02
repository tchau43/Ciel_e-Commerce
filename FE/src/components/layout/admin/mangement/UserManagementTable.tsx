import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/types/dataTypes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserManagementTableProps {
  data: User[];
  triggerRefresh: (value: number) => void;
}

const UserManagementTable = ({
  data,
  triggerRefresh,
}: UserManagementTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (id: number) => {
    navigate(`/admin/editUser/${id}`);
  };

  return (
    <>
      <Card>
        <CardContent className="pb-0 mr">
          <Table className="">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Avatar</TableHead>
                <TableHead>Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={user.imageUrl || ""}></AvatarImage>
                      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{user._id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.status ? "active" : "block"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <p
                      onClick={() => handleEdit(user._id)}
                      className="hover:underline cursor-pointer text-blue-600"
                    >
                      Edit
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default UserManagementTable;
