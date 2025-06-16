import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/utils/api/endpoint";
import userRepository from "@/repositories/user/user";
import { Card, CardContent } from "@/components/ui/card";
import EditUserForm from "../components/EditUserForm";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => userRepository.getUserById(API_ENDPOINTS.USER(id!)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-8 text-foreground/70">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-500/90 dark:text-red-400/90">
        Error loading user data
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-foreground/70">User not found</div>;
  }

  return (
    <div className="p-8 bg-background/50 dark:bg-background/30">
      <Card className="border border-border/10 dark:border-border/20 bg-card/95 dark:bg-card/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-foreground/90 dark:text-foreground/80">
            Chỉnh sửa thông tin người dùng
          </h1>
          <EditUserForm user={user} onCancel={() => navigate("/users")} />
        </CardContent>
      </Card>
    </div>
  );
}
