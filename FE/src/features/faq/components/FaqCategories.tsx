import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FaqCategoriesProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryLabels: Record<string, string> = {
  shipping: "Vận chuyển",
  payment: "Thanh toán",
  returns: "Đổi trả",
  product: "Sản phẩm",
  account: "Tài khoản",
  general: "Chung",
  other: "Khác",
};

const FaqCategories = ({
  categories,
  activeCategory,
  onCategoryChange,
}: FaqCategoriesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        className={cn(
          "rounded-full",
          activeCategory === "all" ? "bg-ch-pink text-white" : ""
        )}
        onClick={() => onCategoryChange("all")}
      >
        Tất cả
      </Button>

      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          className={cn(
            "rounded-full",
            activeCategory === category ? "bg-ch-pink text-white" : ""
          )}
          onClick={() => onCategoryChange(category)}
        >
          {categoryLabels[category] || category}
        </Button>
      ))}
    </div>
  );
};

export default FaqCategories;
