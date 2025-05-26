import { Category } from "@/types/dataTypes";
import { motion } from "framer-motion";

interface CategoryGridProps {
  categories?: Category[];
  isLoading?: boolean;
  error?: unknown;
  onCategoryClick: (category: Category) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  isLoading,
  error,
  onCategoryClick,
}) => {
  return (
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        Danh Mục Sản Phẩm
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-xl p-6 animate-pulse"
            >
              <div className="h-12 bg-gray-200 rounded mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Đã xảy ra lỗi khi tải danh mục sản phẩm
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <motion.div
              key={category._id}
              whileHover={{ scale: 1.05 }}
              className="bg-blue-100 rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onCategoryClick(category)}
            >
              <h3 className="font-medium text-lg text-gray-800">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {category.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
