import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ProductByCategory from "./ProductByCategory";
import { useEffect, useState, useRef, useCallback } from "react"; // Import useRef, useState, useEffect
import { getAuthCredentials } from "@/utils/authUtil";
import { useAddProductToCartMutation } from "@/services/cart/addProductToCartMutation";
import throttle from "lodash/throttle"; // CORRECT - Import specific function

const Product = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const { id } = useParams();
  const { mutate: updateCart, isPending: isAddingToCart } =
    useAddProductToCartMutation();
  const [mainImage, setMainImage] = useState<string | undefined>();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [columnPositions, setColumnPositions] = useState<{
    aLeft: number;
    aLeftToParent: number;
    bLeft: number;
    bLeftToParent: number;
    aWidth: number;
    bWidth: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const columnARef = useRef<HTMLDivElement>(null);
  const columnBRef = useRef<HTMLDivElement>(null);
  const [containerMinHeight, setContainerMinHeight] = useState<number | null>(
    null
  );
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useGetProductByIdQuery(id!, {
    enabled: !!id,
  });

  // 1. Convert to useCallback
  const updatePositions = useCallback(() => {
    if (columnARef.current && columnBRef.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setColumnPositions({
        aLeft: columnARef.current.getBoundingClientRect().left,
        aLeftToParent: columnARef.current.offsetLeft,
        bLeft: columnBRef.current.getBoundingClientRect().left,
        bLeftToParent: columnBRef.current.offsetLeft,
        aWidth: columnARef.current.offsetWidth,
        bWidth: columnBRef.current.offsetWidth,
      });
    }
  }, []);

  // 2. Add position updaters
  useEffect(() => {
    const resizeObserver = new ResizeObserver(throttle(updatePositions, 100));
    const scrollUpdater = throttle(updatePositions, 100);

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    if (columnARef.current) resizeObserver.observe(columnARef.current);
    if (columnBRef.current) resizeObserver.observe(columnBRef.current);

    window.addEventListener("scroll", scrollUpdater);
    updatePositions(); // Initial call

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scrollUpdater);
    };
  }, [updatePositions]);

  // 3. Fix scroll handler
  const handleScroll = useCallback(() => {
    if (!columnPositions || !containerRef.current) return;

    const STICKY_TOP_OFFSET = 10;
    const scrollY = window.scrollY;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerTop = containerRect.top + scrollY;
    const containerHeight = containerRect.height;

    const colA = columnARef.current!;
    const colB = columnBRef.current!;
    const colAHeight = colA.offsetHeight;
    const colBHeight = colB.offsetHeight;

    [colA, colB].forEach((col) => (col.style.cssText = ""));

    const isATaller = colAHeight > colBHeight;
    const shorterCol = isATaller ? colB : colA;
    const shorterHeight = Math.min(colAHeight, colBHeight);
    const tallererHeight = Math.max(colAHeight, colBHeight);

    // Calculate thresholds based on container height
    const scrollStartThreshold = containerTop - STICKY_TOP_OFFSET;
    const scrollStopThreshold =
      containerTop + containerHeight - shorterHeight - STICKY_TOP_OFFSET;
    const horizontalPositionStyle = isATaller
      ? `right: 0;` // If A is taller, B is shorter (pin B right)
      : `left: 0;`; // If B is taller, A is shorter (pin A left)

    if (scrollY >= scrollStartThreshold && scrollY < scrollStopThreshold) {
      shorterCol.style.cssText = `
        position: fixed;
        top: ${STICKY_TOP_OFFSET}px;
        left: ${isATaller ? columnPositions.bLeft : columnPositions.aLeft}px;
        width: ${isATaller ? columnPositions.bWidth : columnPositions.aWidth}px;
        z-index: 10;
        transition: left 0.3s ease;
      `;
    } else if (scrollY >= scrollStopThreshold) {
      // console.log("---------------chcek11");
      shorterCol.style.cssText = `
        position: absolute;
        top: auto;
        bottom: 0;
        ${horizontalPositionStyle};
        width: ${isATaller ? columnPositions.bWidth : columnPositions.aWidth}px;
        z-index: ;
        transition: left 0.3s ease;
      `;
    } else {
      colA.style.position = "";
      colA.style.bottom = "";
      colA.style.top = "";
      colA.style.left = "";
      colA.style.width = "";
      colA.style.zIndex = "";
      colB.style.position = "";
      colB.style.bottom = "";
      colB.style.top = "";
      colB.style.left = "";
      colB.style.width = "";
      colB.style.zIndex = "";
    }
  }, [columnPositions]);

  // 4. Fix useEffect dependencies
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 16);
    window.addEventListener("scroll", throttledScroll);
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (product?.images && product.images.length > 0 && product.images[0]) {
      setMainImage(product.images[0]);
    } else if (product) {
      setMainImage("/logo.png");
    }
    setSelectedVariantId(null);
    setContainerMinHeight(null);
  }, [product]);

  useEffect(() => {
    if (product && !isLoading) {
      let retryTimeoutId: NodeJS.Timeout | null = null;
      let initialTimeoutId: NodeJS.Timeout | null = null;

      const measureHeight = () => {
        // Re-check refs inside timeout/retry
        if (containerRef.current && columnARef.current && columnBRef.current) {
          const measuredHeight = containerRef.current.offsetHeight;
          const colAHeight = columnARef.current.offsetHeight;
          const colBHeight = columnBRef.current.offsetHeight;

          if (measuredHeight > 50 && colAHeight > 50 && colBHeight > 50) {
            setContainerMinHeight(measuredHeight);
          } else {
            retryTimeoutId = setTimeout(measureHeight, 200); // Retry delay
          }
        }
      };
      initialTimeoutId = setTimeout(measureHeight, 150); // Initial delay
      return () => {
        if (initialTimeoutId) clearTimeout(initialTimeoutId);
        if (retryTimeoutId) clearTimeout(retryTimeoutId);
      };
    }
  }, [product, isLoading]);

  // --- Loading and Error States ---
  if (isLoading) {
    return (
      <p className="text-center text-gray-600 py-10">Loading product data...</p>
    );
  }
  if (isAddingToCart) {
    return <p className="text-center text-gray-600 py-10">Adding to cart...</p>;
  }
  if (isError) {
    console.error("Error fetching product:", error);
    return (
      <p className="text-center text-red-600 py-10">
        Error loading product. Please try again.
      </p>
    );
  }
  if (!product) {
    return (
      <p className="text-center text-gray-600 py-.0">Product not found.</p>
    );
  }

  const handleIncreaseQuantity = () => setQuantity((q) => q + 1);
  const handleDecreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const handleVariantSelect = (variantId: string) =>
    setSelectedVariantId(variantId);
  const handleImgClick = (index: number) => {
    const imageSources =
      product?.images?.filter(
        (imgUrl) => typeof imgUrl === "string" && imgUrl.trim() !== ""
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
        userId,
        productId: product._id,
        quantity: quantity,
        variantId: selectedVariantId,
      },
    });
  };

  // --- Calculations for display ---
  const selectedVariant = product.variants?.find(
    (v) => v._id === selectedVariantId
  );
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : Number(product.base_price);

  // --- Image sources calculation ---
  const imageSources =
    product?.images?.filter(
      (imgUrl) => typeof imgUrl === "string" && imgUrl.trim() !== ""
    ) ?? [];

  return (
    <div className="">
      <p className="font-sans font-normal text-sm text-gray-500 mb-6">
        <span
          className="hover:text-orange-600 hover:cursor-pointer hover:underline"
          onClick={() => navigate("/product")}
        >
          SẢN PHẨM
        </span>
        {` / `}
        <span
          className="hover:text-orange-600 hover:cursor-pointer hover:underline"
          onClick={() => navigate(`/product?category=${product.category._id}`)}
        >
          {product.category.name}
        </span>
        {` / `}
        <span className="text-gray-800">{product.name.toUpperCase()}</span>
      </p>
      {/* --- Main Layout: Two Columns --- */}
      <div
        ref={containerRef}
        className="flex flex-col md:flex-row items-start relative"
      >
        {/* --- Column A: Images & Description --- */}
        <div
          ref={columnARef}
          className="w-full md:w-3/5 pr-4 lg:w-2/3 mb-8 md:mb-0"
        >
          {/* Image Gallery Section */}
          <div className="flex gap-4 mb-8">
            <div className="h-[404px] 2xl:h-[600px] flex-shrink-0 w-24 flex flex-col gap-y-2 overflow-y-auto pr-2 snap-y snap-mandatory scroll-smooth custom-scrollbar">
              {imageSources.map((imgUrl, index) => (
                <img
                  key={index}
                  className={`w-20 h-20 object-cover cursor-pointer border-2 ${
                    mainImage === imgUrl
                      ? "border-orange-500"
                      : "border-transparent"
                  } hover:border-gray-400 flex-shrink-0 snap-start`}
                  alt={`Thumbnail ${index + 1}`}
                  src={imgUrl}
                  onClick={() => handleImgClick(index)}
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
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
            {/* Main Image */}
            <div className="h-[404px] 2xl:h-[600px] flex-grow flex justify-center items-center min-w-0">
              <img
                className="max-h-full max-w-full object-contain"
                alt={product.name}
                src={mainImage || "/logo.png"}
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            </div>
          </div>
          <div className="mt-8 md:mt-0">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Product Description
              </h2>
              {product.description.map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mb-12 prose max-w-none">
              <Outlet context={{ product, selectedVariantId }} />
            </div>
          </div>
        </div>
        {/* End Column A */}
        {/* --- Column B: Info & Actions --- */}
        <div ref={columnBRef} className="w-full md:w-2/5 lg:w-1/3 space-y-4">
          <h1 className="font-semibold text-2xl lg:text-3xl text-gray-800">
            {product.name}
          </h1>
          <p className="font-semibold text-xl lg:text-2xl text-orange-600 min-h-[2rem]">
            {displayPrice.toLocaleString("vi-VN")} VND
            {selectedVariant && Number(product.base_price) !== displayPrice && (
              <span className="ml-3 text-base text-gray-500 line-through">
                {Number(product.base_price).toLocaleString("vi-VN")} VND
              </span>
            )}
          </p>
          {product.variants && product.variants.length > 0 && (
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Select Option:
              </p>
              <div className="flex flex-col gap-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => handleVariantSelect(variant._id)}
                    type="button"
                    className={`w-full px-4 py-2.5 border rounded-lg text-left text-sm transition-all duration-150 ease-in-out flex-shrink-0 focus:outline-none ${
                      selectedVariantId === variant._id
                        ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold shadow-sm"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {variant.types}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Other Info */}
          <div className="pt-2 space-y-1 text-sm border-t mt-4">
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Danh mục:</span>{" "}
              {product.category.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-gray-800">Hãng:</span>{" "}
              {product.brand?.name ?? "N/A"}
            </p>
            {product.tags && product.tags.length > 0 && (
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Tags:</span>{" "}
                {product.tags.join(", ")}
              </p>
            )}
          </div>
          {/* Quantity Selector */}
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
              className="border-gray-300 text-center w-12 h-7 rounded-md"
              aria-label="Quantity"
            />
            <button
              onClick={handleIncreaseQuantity}
              className="border rounded-md w-7 h-7 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
            >
              +
            </button>
          </div>
          {/* Add to Cart Button */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || isAddingToCart}
              className={`w-full hover:cursor-pointer text-base font-semibold border rounded-lg px-5 py-3 transition ease-in-out duration-300 ${
                !selectedVariantId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              } ${isAddingToCart ? "opacity-70 cursor-wait" : ""} `}
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>
          {/* Wholesale/Agent Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="flex-1 bg-orange-600 h-10 px-4 text-white text-xs font-medium hover:bg-orange-700 rounded min-w-[120px]">
              Liên hệ báo giá sỉ
            </button>
            <button className="flex-1 bg-teal-600 h-10 px-4 text-white text-xs font-medium hover:bg-teal-700 rounded min-w-[120px]">
              Đăng ký đại lý
            </button>
          </div>
        </div>
        {/* End Column B */}
      </div>
      <div className="mt-12">
        <ProductByCategory category={product.category._id} />
      </div>
    </div>
  );
};

export default Product;
