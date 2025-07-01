import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { useGetProductReviewsQuery } from "@/services/review/getProductReviewsQuery";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getAuthCredentials } from "@/utils/authUtil";
import { useAddProductToCartMutation } from "@/services/cart/addProductToCartMutation";
import { Product as ProductType, Variant } from "@/types/dataTypes";
import { toast } from "sonner";
import { motion } from "framer-motion";

const TestPage2 = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const { id } = useParams<{ id: string }>();

  const { mutate: updateCart, isPending: isAddingToCart } =
    useAddProductToCartMutation();
  const [mainImage, setMainImage] = useState<string | undefined>();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const columnARef = useRef<HTMLDivElement>(null);
  const columnBRef = useRef<HTMLDivElement>(null);
  console.log(columnARef.current?.offsetHeight, "columnARef");
  console.log(columnBRef.current?.offsetHeight, "columnBRef");
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductByIdQuery(id!, {
    enabled: !!id,
  });

  useGetProductReviewsQuery(id!, {
    enabled: !!id,
  });

  useEffect(() => {
    const typedProduct = product as ProductType | undefined;
    if (
      typedProduct?.images &&
      typedProduct.images.length > 0 &&
      typedProduct.images[0]
    ) {
      setMainImage(typedProduct.images[0]);
    } else if (typedProduct) {
      setMainImage("/logo.png");
    }
    setSelectedVariantId(null);
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-ch-pink-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 py-10">
            Loading product data...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error("Error fetching product:", error);
    return (
      <div className="min-h-screen pt-16 bg-ch-pink-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-red-600 py-10">
            Error loading product. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const typedProduct = product as ProductType;

  if (!typedProduct) {
    return (
      <div className="min-h-screen pt-16 bg-ch-pink-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 py-10">Product not found.</p>
        </div>
      </div>
    );
  }

  const handleIncreaseQuantity = () => setQuantity((q) => q + 1);
  const handleDecreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const handleVariantSelect = (variantId: string) =>
    setSelectedVariantId(variantId);

  const handleImgClick = (index: number) => {
    const imageSources =
      typedProduct?.images?.filter(
        (imgUrl: string): imgUrl is string =>
          typeof imgUrl === "string" && imgUrl.trim() !== ""
      ) ?? [];
    if (imageSources && imageSources[index]) {
      setMainImage(imageSources[index]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariantId) {
      alert("Please select a product variant.");
      return;
    }
    const { userInfo } = getAuthCredentials();
    const userId = userInfo?._id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/auth");
      return;
    }
    if (quantity <= 0) return;

    updateCart(
      {
        variables: {
          productId: typedProduct._id,
          quantity: quantity,
          variantId: selectedVariantId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sản phẩm đã được thêm vào giỏ hàng!");
        },
        onError: (error) => {
          toast.error("Không thể thêm vào giỏ hàng: " + error.message);
        },
      }
    );
  };

  const selectedVariant = typedProduct.variants?.find(
    (v: Variant) => v._id === selectedVariantId
  );
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : Number(typedProduct.base_price);

  const imageSources =
    typedProduct?.images?.filter(
      (imgUrl: string): imgUrl is string =>
        typeof imgUrl === "string" && imgUrl.trim() !== ""
    ) ?? [];

  return (
    <div className="flex md:flex-row gap-8 p-6">
      {/* Left Column - Images */}
      <div ref={columnARef} className="w-full md:w-3/5 lg:w-3/5">
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="h-[404px] 2xl:h-[600px] flex-shrink-0 w-24 flex flex-col gap-y-2 overflow-y-auto pr-2 snap-y snap-mandatory scroll-smooth custom-scrollbar">
            {imageSources.map((imgUrl: string, index: number) => (
              <motion.img
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`w-20 h-20 object-cover cursor-pointer border-2 rounded-lg ${
                  mainImage === imgUrl ? "border-ch-blue" : "border-transparent"
                } hover:border-gray-400 flex-shrink-0 snap-start`}
                alt={`Thumbnail ${index + 1}`}
                src={imgUrl}
                onClick={() => handleImgClick(index)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
            ))}
            {imageSources.length === 0 && (
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Placeholder"
                  className="w-12 h-12 object-contain opacity-50"
                />
              </div>
            )}
          </div>

          {/* Main Image */}
          <div className="h-[404px] 2xl:h-[600px] flex-grow flex justify-center items-center bg-gray-50 rounded-xl">
            <img
              className="max-h-full max-w-full object-contain p-4"
              alt={typedProduct.name}
              src={mainImage || "/logo.png"}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          {typedProduct.description && typedProduct.description.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Mô tả sản phẩm
              </h2>
              {typedProduct.description.map(
                (paragraph: string, index: number) => (
                  <p key={index} className="mb-4 last:mb-0 text-gray-700">
                    {paragraph}
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Product Info */}
      <div
        ref={columnBRef}
        className="w-full md:w-2/5 lg:w-2/5 bg-red-500 h-fit sticky top-0"
      >
        <div className="">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
            {typedProduct.name}
          </h1>

          <div className="space-y-6">
            {/* Price */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-2xl lg:text-3xl font-bold text-ch-pink">
                {displayPrice.toLocaleString("vi-VN")} VND
                {selectedVariant &&
                  Number(typedProduct.base_price) !== displayPrice && (
                    <span className="ml-3 text-base text-gray-500 line-through">
                      {Number(typedProduct.base_price).toLocaleString("vi-VN")}{" "}
                      VND
                    </span>
                  )}
              </p>
            </div>

            {/* Variants */}
            {typedProduct.variants && typedProduct.variants.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium text-gray-700">Chọn phiên bản:</p>
                <div className="grid grid-cols-1 gap-2">
                  {typedProduct.variants.map((variant: Variant) => (
                    <button
                      key={variant._id}
                      onClick={() => handleVariantSelect(variant._id)}
                      className={`w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        selectedVariantId === variant._id
                          ? "bg-ch-blue text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="font-medium">{variant.types}</span>
                      <span className="block text-sm opacity-80">
                        {variant.price.toLocaleString("vi-VN")} VND
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <p className="font-medium text-gray-700">Số lượng:</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-20 h-10 text-center border rounded-lg"
                />
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedVariantId}
              className={`w-full py-4 rounded-lg font-medium transition-all duration-200 ${
                isAddingToCart || !selectedVariantId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-ch-blue text-white hover:bg-ch-blue-600"
              }`}
            >
              {isAddingToCart
                ? "Đang thêm..."
                : !selectedVariantId
                ? "Vui lòng chọn phiên bản"
                : "Thêm vào giỏ hàng"}
            </button>

            {/* Product Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {typedProduct.category && (
                <p className="text-gray-600">
                  <span className="font-medium">Danh mục:</span>{" "}
                  {typedProduct.category.name}
                </p>
              )}
              {typedProduct.brand && (
                <p className="text-gray-600">
                  <span className="font-medium">Thương hiệu:</span>{" "}
                  {typedProduct.brand.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage2;
