import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteVariantMutation } from "@/services/product/deleteVariantMutation";
import { Variant, VariantInput } from "@/types/dataTypes";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VariantListProps {
  variants: Variant[];
  onDelete: (variantId: string) => Promise<void>;
  onEdit: (variantId: string, data: VariantInput) => Promise<void>;
  onAdd: (data: VariantInput) => Promise<void>;
}

interface VariantFormData {
  types: string;
  price: number;
  stock: number;
}

const VariantList = ({
  variants,
  onDelete,
  onEdit,
  onAdd,
}: VariantListProps) => {
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>({
    types: "",
    price: 0,
    stock: 0,
  });

  const handleEditClick = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData({
      types: variant.types,
      price: variant.price,
      stock: variant.stock,
    });
  };

  const handleAddClick = () => {
    setIsAddingVariant(true);
    setFormData({
      types: "",
      price: 0,
      stock: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVariant) {
        await onEdit(editingVariant._id, formData);
        setEditingVariant(null);
      } else {
        await onAdd(formData);
        setIsAddingVariant(false);
      }
      setFormData({ types: "", price: 0, stock: 0 });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu biến thể");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "types" ? value : Number(value),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground/90 dark:text-foreground/80">
          Biến thể sản phẩm
        </h3>
        <Button onClick={handleAddClick} variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Thêm biến thể
        </Button>
      </div>

      <div className="grid gap-4">
        {variants.map((variant) => (
          <Card
            key={variant._id}
            className="p-4 bg-card/95 dark:bg-card/90 border-border/10 dark:border-border/20"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-foreground/90 dark:text-foreground/80">
                  {variant.types}
                </h4>
                <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60">
                  Giá: {variant.price.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-sm text-muted-foreground/70 dark:text-muted-foreground/60 mt-1">
                  Số lượng: {variant.stock}
                </p>
                <div className="text-xs text-muted-foreground/60 dark:text-muted-foreground/50 mt-2">
                  <p>
                    Ngày tạo: {new Date(variant.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Cập nhật: {new Date(variant.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(variant)}
                  className="border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(variant._id)}
                  className="bg-destructive/90 hover:bg-destructive/100 dark:bg-destructive/80 dark:hover:bg-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={editingVariant !== null || isAddingVariant}
        onOpenChange={() => {
          setEditingVariant(null);
          setIsAddingVariant(false);
        }}
      >
        <DialogContent className="sm:max-w-[425px] bg-card/95 dark:bg-card/90 border-border/10 dark:border-border/20">
          <DialogHeader>
            <DialogTitle className="text-foreground/90 dark:text-foreground/80">
              {editingVariant ? "Sửa biến thể" : "Thêm biến thể mới"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="types"
                className="text-foreground/90 dark:text-foreground/80"
              >
                Loại
              </Label>
              <Input
                id="types"
                name="types"
                value={formData.types}
                onChange={handleChange}
                placeholder="Nhập loại biến thể"
                className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-foreground/90 dark:text-foreground/80"
              >
                Giá
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
                min={0}
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="stock"
                className="text-foreground/90 dark:text-foreground/80"
              >
                Số lượng
              </Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                className="bg-input/90 dark:bg-input/80 border-input/20 dark:border-input/10"
                min={0}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingVariant(null);
                  setIsAddingVariant(false);
                }}
                className="border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20"
              >
                Hủy
              </Button>
              <Button type="submit" variant="default">
                {editingVariant ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariantList;
