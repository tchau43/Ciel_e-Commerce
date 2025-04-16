// src/components/product/ProductCard.tsx

import { ProductData } from "@/types/dataTypes";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: ProductData;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Simple price display: Use first variant price if available, otherwise base_price
  const displayPrice = product.variants?.[0]?.price ?? product.base_price;

  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white">
      <Link to={`/product/${product._id}`} className="block">
        <img
          // Use the first image or a placeholder
          src={product.images?.[0] || "/placeholder-image.png"}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-image.png";
          }} // Fallback image
        />
        <div className="p-4">
          <h3
            className="font-semibold text-lg truncate text-gray-800"
            title={product.name}
          >
            {product.name}
          </h3>
          {/* Optional: Display category or brand */}
          {/* <p className="text-sm text-gray-500">{product.category?.name}</p> */}
          <p className="text-red-600 font-medium mt-2">
            {displayPrice > 0
              ? `${displayPrice.toLocaleString("vi-VN")} VND`
              : "Contact for price"}
          </p>
        </div>
      </Link>
      {/* Optional: Add to cart button - would need separate logic */}
      {/* <div className="px-4 pb-4">
         <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Add to Cart</button>
       </div> */}
    </div>
  );
};

export default ProductCard;
