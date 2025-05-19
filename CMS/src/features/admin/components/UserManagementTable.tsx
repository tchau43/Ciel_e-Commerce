// src/features/admin/components/UserManagementTable.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// Removed CardHeader, CardTitle as we integrate the title differently or assume it's outside
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Role } from "@/types/dataTypes";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";

interface UserManagementTableProps {
  data: User[];
  title?: string; // Optional title prop
}

const UserManagementTable = ({
  data,
  title = "Quản lý Người dùng",
}: UserManagementTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/editUser/${id}`);
  };

  // Helper functions for badge variants (assuming Role enum exists)
  const getStatusVariant = (
    status: boolean
  ): "default" | "destructive" | "outline" | "secondary" => {
    // Using 'default' (often green/blue in themes) for active, 'outline' for inactive
    return status ? "default" : "outline";
  };

  const getRoleVariant = (role: Role): "default" | "secondary" | "outline" => {
    switch (role) {
      case Role.ADMIN:
        return "secondary"; // e.g., Gray badge for Admin
      case Role.CUSTOMER:
        return "outline"; // e.g., Bordered badge for Customer
      default:
        return "outline";
    }
  };

  return (
    // Card blends with background, defined by border. Removed shadow for flatter look.
    <Card className="border bg-card rounded-lg overflow-hidden">
      {/* Optional: Add title outside or pass as prop */}
      {/* <h2 className="text-xl font-semibold p-4">{title}</h2> */}

      <CardContent className="p-0">
        <Table>
          {/* Use a subtle border instead of background for the header */}
          <TableHeader className="border-b bg-muted/30">
            <TableRow>
              <TableHead className="w-16 pl-6 text-muted-foreground">
                Ảnh
              </TableHead>
              <TableHead className="text-muted-foreground">Tên</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-center text-muted-foreground">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-muted-foreground">
                Vai trò
              </TableHead>
              <TableHead className="text-right w-20 pr-6 text-muted-foreground">
                Sửa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((user) => (
                // Subtle hover, slightly lighter text for primary info
                <TableRow
                  key={user._id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors border-b last:border-b-0"
                >
                  <TableCell className="pl-6 py-3">
                    {" "}
                    {/* Adjusted padding */}
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.image || "/placeholder-avatar.png"}
                        alt={user.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-avatar.png";
                        }}
                      />
                      <AvatarFallback className="text-xs">
                        {user.name?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  {/* Using slightly less prominent text color */}
                  <TableCell className="font-medium text-foreground/90 dark:text-foreground/80 py-3">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge
                      variant={getStatusVariant(user.status)}
                      className="capitalize text-xs px-2 py-0.5"
                    >
                      {" "}
                      {/* Adjusted badge padding/size */}
                      {user.status ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge
                      variant={getRoleVariant(user.role)}
                      className="capitalize text-xs px-2 py-0.5"
                    >
                      {" "}
                      {/* Adjusted badge padding/size */}
                      {user.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary" // Muted icon color, primary on hover
                      onClick={() => handleEdit(user._id)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Sửa người dùng</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy người dùng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {/* Pagination remains in footer, border-t provides separation */}
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t pt-4 pb-4">
          {" "}
          {/* Adjusted padding */}
          <div className="text-xs text-muted-foreground">
            Trang {currentPage} / {totalPages} (Tổng: {data.length} người dùng)
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Trang sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserManagementTable;
