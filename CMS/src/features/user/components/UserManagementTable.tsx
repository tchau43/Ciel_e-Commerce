// src/features/admin/components/UserManagementTable.tsx

import { useState, useMemo, useEffect } from "react";
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
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserManagementTableProps {
  data: User[];
  title?: string;
}

const UserManagementTable = ({ data }: UserManagementTableProps) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User | "role" | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const itemsPerPage = 8;

  // Sorting logic
  const sortedData = useMemo(() => {
    const sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortConfig.key === "role") {
          aVal = a.role.toLowerCase();
          bVal = b.role.toLowerCase();
        } else {
          aVal = (a[sortConfig.key as keyof User] || "")
            .toString()
            .toLowerCase();
          bVal = (b[sortConfig.key as keyof User] || "")
            .toString()
            .toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const handleSort = (key: keyof User | "role") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/editUser/${id}`);
  };

  // Helper for sort icons
  const SortIcon = ({ columnKey }: { columnKey: keyof User | "role" }) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/70" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    );
  };

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Helper functions for badge variants
  const getStatusVariant = (status: boolean): "default" | "destructive" => {
    return status ? "default" : "destructive";
  };

  const getRoleVariant = (role: Role): "default" | "secondary" | "outline" => {
    switch (role) {
      case Role.ADMIN:
        return "secondary";
      case Role.CUSTOMER:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90 backdrop-blur-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b border-border/10 dark:border-border/20 bg-muted/30 dark:bg-muted/20">
            <TableRow>
              <TableHead className="w-16 pl-6 text-muted-foreground/70 dark:text-muted-foreground/60">
                Ảnh
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Tên <SortIcon columnKey="name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email <SortIcon columnKey="email" />
                </div>
              </TableHead>
              <TableHead className="text-muted-foreground/70 dark:text-muted-foreground/60">
                Số điện thoại
              </TableHead>
              <TableHead className="text-center text-muted-foreground/70 dark:text-muted-foreground/60">
                Trạng thái
              </TableHead>
              <TableHead
                className="text-center cursor-pointer text-muted-foreground/70 dark:text-muted-foreground/60 hover:text-foreground/90 dark:hover:text-foreground/80 transition-colors"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center justify-center">
                  Vai trò <SortIcon columnKey="role" />
                </div>
              </TableHead>
              <TableHead className="text-right w-20 pr-6 text-muted-foreground/70 dark:text-muted-foreground/60">
                Sửa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((user) => (
                <TableRow
                  key={user._id}
                  className="hover:bg-muted/30 dark:hover:bg-muted/20 transition-colors border-b border-border/10 dark:border-border/20 last:border-b-0"
                >
                  <TableCell className="pl-6 py-3">
                    <Avatar className="h-9 w-9 ring-1 ring-border/10 dark:ring-border/20">
                      <AvatarImage
                        src={user.image || "/placeholder-avatar.png"}
                        alt={user.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder-avatar.png";
                        }}
                      />
                      <AvatarFallback className="text-xs bg-muted/40 dark:bg-muted/30">
                        {user.name?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-foreground/90 dark:text-foreground/80">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground/70 dark:text-muted-foreground/60">
                    {user.phoneNumber || "Chưa cập nhật"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={getStatusVariant(user.status)}
                      className={`capitalize text-xs px-2 py-0.5 ${
                        user.status
                          ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-500/30 dark:hover:bg-emerald-500/40"
                          : "bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground dark:bg-destructive/30 dark:hover:bg-destructive/40"
                      }`}
                    >
                      {user.status ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={getRoleVariant(user.role)}
                      className="capitalize text-xs px-2 py-0.5 bg-opacity-90 dark:bg-opacity-80"
                    >
                      {user.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/70 hover:text-primary/90 dark:text-muted-foreground/60 dark:hover:text-primary/80"
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
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground/70 dark:text-muted-foreground/60"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-base">Không tìm thấy người dùng nào.</p>
                    <p className="text-sm text-muted-foreground/60 dark:text-muted-foreground/50">
                      Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t border-border/10 dark:border-border/20 pt-4 pb-4">
          <div className="text-xs text-muted-foreground/70 dark:text-muted-foreground/60">
            Trang {currentPage} / {totalPages} (Tổng: {data.length} người dùng)
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
            >
              <span className="sr-only">Trang trước</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
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
