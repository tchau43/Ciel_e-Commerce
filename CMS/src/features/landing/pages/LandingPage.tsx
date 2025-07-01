import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAuthCredentials } from "@/utils/authUtil";
import { Role } from "@/types/dataTypes";

const LandingPage = () => {
  const navigate = useNavigate();
  const { token, role } = getAuthCredentials();

  const handleNavigate = () => {
    if (token) {
      if (role === Role.ADMIN) {
        navigate("/admin/dashboard");
      } else {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 dark:from-background dark:to-muted/20">
      <div className="text-center space-y-6 p-8 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground/90 dark:text-foreground/80">
          Ciel e-Commerce CMS
        </h1>
        <p className="text-lg text-muted-foreground/70 dark:text-muted-foreground/60">
          Hệ thống quản lý nội dung cho cửa hàng trực tuyến Ciel e-Commerce
        </p>
        <Button
          onClick={handleNavigate}
          size="lg"
          className="mt-8 bg-primary/90 hover:bg-primary/80 text-primary-foreground/90 hover:text-primary-foreground/80"
        >
          {token && role === Role.ADMIN
            ? "Đi đến trang quản trị"
            : "Đăng nhập để tiếp tục"}
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
