import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ProductByCategory from "./ProductByCategory";
import { useEffect, useState, useRef } from "react";
import { getAuthCredentials } from "@/utils/authUtil";
import { useAddProductToCartMutation } from "@/services/cart/addProductToCartMutation";
import { Product as ProductType, Variant } from "@/types/dataTypes";

const Product = () => {
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

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductByIdQuery(id!, {
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
      <p className="text-center text-gray-600 py-10">Loading product data...</p>
    );
  }

  if (isError) {
    console.error("Error fetching product:", error);
    return (
      <p className="text-center text-red-600 py-10">
        Error loading product. Please try again.
      </p>
    );
  }

  const typedProduct = product as ProductType;

  if (!typedProduct) {
    return (
      <p className="text-center text-gray-600 py-10">Product not found.</p>
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
      navigate("/login");
      return;
    }
    if (quantity <= 0) return;
    updateCart({
      variables: {
        productId: typedProduct._id,
        quantity: quantity,
        variantId: selectedVariantId,
      },
    });
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
    <div className="min-h-screen min-w-full">
      <p className="font-sans font-normal text-sm text-gray-500 mb-6">
        <span
          className="hover:text-ch-blue hover:cursor-pointer hover:underline" // Use ch-blue for link hover
          onClick={() => navigate("/product")}
        >
          SẢN PHẨM
        </span>
        {typedProduct.category && (
          <>
            {` / `}
            <span
              className="hover:text-ch-blue hover:cursor-pointer hover:underline" // Use ch-blue for link hover
              onClick={() =>
                navigate(`/product?category=${typedProduct.category?._id}`)
              }
            >
              {typedProduct.category.name}
            </span>
          </>
        )}
        {` / `}
        <span className="text-gray-800">{typedProduct.name.toUpperCase()}</span>
      </p>
      <div className="flex flex-col md:flex-row gap-x-8 bg-ch-blue-10 m-4">
        <div
          ref={columnARef}
          className={`w-full md:w-3/5 lg:flex-2 mb-8 md:mb-0`}
        >
          <div className="flex gap-4 mb-8 ">
            <div className="h-[404px] 2xl:h-[600px] flex-shrink-0 w-24 flex flex-col gap-y-2 overflow-y-auto pr-2 snap-y snap-mandatory scroll-smooth custom-scrollbar">
              {imageSources.map((imgUrl: string, index: number) => (
                <img
                  key={index}
                  className={`w-20 h-20 object-cover cursor-pointer border-2 ${
                    mainImage === imgUrl
                      ? "border-ch-blue" // Use ch-blue for selected border
                      : "border-transparent"
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
                <img
                  src="/logo.png"
                  alt="Placeholder"
                  className="w-20 h-20 object-contain opacity-50"
                />
              )}
            </div>
            <div className="h-[404px] 2xl:h-[600px] flex-grow flex justify-center items-center min-w-0">
              <img
                className="max-h-full max-w-full object-contain"
                alt={typedProduct.name}
                src={mainImage || "/logo.png"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
            </div>
          </div>
          <div className="mt-8 md:mt-0 ml-4">
            {typedProduct.description &&
              typedProduct.description.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Product Description
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
            <div className="mt-6 mb-12 prose max-w-none">
              <Outlet context={{ product: typedProduct, selectedVariantId }} />
            </div>
          </div>
        </div>
        <div ref={columnBRef} className={`w-full md:w-2/5 lg:flex-1 space-y-4`}>
          <h1 className="font-semibold text-2xl lg:text-3xl text-gray-800">
            {typedProduct.name}
          </h1>
          <p className="font-semibold text-xl lg:text-2xl text-ch-red min-h-[2rem]">
            {" "}
            {/* Use ch-red for price */}
            {displayPrice.toLocaleString("vi-VN")} VND
            {selectedVariant &&
              Number(typedProduct.base_price) !== displayPrice && (
                <span className="ml-3 text-base text-gray-500 line-through">
                  {Number(typedProduct.base_price).toLocaleString("vi-VN")} VND
                </span>
              )}
          </p>
          {typedProduct.variants && typedProduct.variants.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Select Option:
              </p>
              <div className="flex flex-col gap-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {typedProduct.variants.map((variant: Variant) => (
                  <button
                    key={variant._id}
                    onClick={() => handleVariantSelect(variant._id)}
                    type="button"
                    className={`w-full px-4 py-2.5 border rounded-lg text-left text-sm transition-all duration-150 ease-in-out flex-shrink-0 focus:outline-none ${
                      selectedVariantId === variant._id
                        ? "border-ch-blue bg-ch-blue-10 text-ch-blue font-semibold shadow-sm" // Use ch-blue theme for selected variant
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {variant.types}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="pt-2 space-y-1 text-sm border-t mt-4">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Danh mục:</span>{" "}
              {typedProduct.category?.name ?? "N/A"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Hãng:</span>{" "}
              {typedProduct.brand?.name ?? "N/A"}
            </p>
            {typedProduct.tags && typedProduct.tags.length > 0 && (
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Tags:</span>{" "}
                {typedProduct.tags.join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-x-2 pt-2">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Quantity:
            </span>
            <button
              onClick={handleDecreaseQuantity}
              disabled={quantity <= 1}
              className="border rounded-md w-7 h-7 flex items-center justify-center text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              readOnly
              value={quantity}
              className="border-gray-300 text-center w-12 h-7 rounded-md border"
              aria-label="Quantity"
            />
            <button
              onClick={handleIncreaseQuantity}
              className="border rounded-md w-7 h-7 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || isAddingToCart}
              className={`w-full hover:cursor-pointer text-base font-semibold border rounded-lg px-5 py-3 transition ease-in-out duration-300 ${
                !selectedVariantId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isAddingToCart
                  ? "bg-ch-red-50 text-ch-red cursor-wait border-ch-red-100" // Use ch-red theme for adding state
                  : "bg-ch-red text-white hover:bg-ch-red-100 border-ch-red hover:border-ch-red-100" // Use ch-red theme for Add to Cart button
              }`}
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="flex-1 bg-ch-blue h-10 px-4 text-white text-xs font-medium hover:bg-ch-blue-100 rounded min-w-[120px]">
              {" "}
              {/* Use ch-blue */}
              Liên hệ báo giá sỉ
            </button>
            <button className="flex-1 bg-ch-gray-500 h-10 px-4 text-white text-xs font-medium hover:bg-ch-gray-900 rounded min-w-[120px]">
              {" "}
              {/* Use gray for secondary? Or blue/red? */}
              Đăng ký đại lý
            </button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        {typedProduct.category?._id && (
          <ProductByCategory category={typedProduct.category._id} />
        )}
      </div>
    </div>
  );
};

export default Product;
