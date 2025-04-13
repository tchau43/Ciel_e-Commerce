import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import ProductByCategory from "./ProductByCategory";
import { useEffect, useState, useRef } from "react"; // Import useRef, useState, useEffect
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

  useEffect(() => {
    if (product?.images && product.images.length > 0 && product.images[0]) {
      setMainImage(product.images[0]);
    } else if (product) {
      setMainImage("/logo.png");
    }
    setSelectedVariantId(null);
    // Reset measured height when product changes so it gets remeasured
    setContainerMinHeight(null);
  }, [product]);
  console.log("------------------containerMinHeight", containerMinHeight);

  // --- Effect to Measure Container Height Once Loaded (More Robust) ---
  useEffect(() => {
    // Only measure if product loaded, ALL refs available, and height not set
    if (
      product &&
      !isLoading &&
      containerRef.current &&
      columnARef.current && // Check column refs too
      columnBRef.current && // Check column refs too
      !containerMinHeight
    ) {
      let retryTimeoutId: NodeJS.Timeout | null = null;
      let initialTimeoutId: NodeJS.Timeout | null = null;

      const measureHeight = () => {
        // Re-check refs inside timeout/retry
        if (containerRef.current && columnARef.current && columnBRef.current) {
          const measuredHeight = containerRef.current.offsetHeight;
          const colAHeight = columnARef.current.offsetHeight;
          const colBHeight = columnBRef.current.offsetHeight;

          // console.log(`Measuring: Container=${measuredHeight}, A=${colAHeight}, B=${colBHeight}`);

          // Set height only if container AND columns seem to have rendered height (adjust '50' if needed)
          if (measuredHeight > 50 && colAHeight > 50 && colBHeight > 50) {
            // console.log("Setting Container MinHeight:", measuredHeight);
            setContainerMinHeight(measuredHeight);
          } else {
            // Retry if height is still too small (layout might still be settling)
            // console.log("Retrying height measurement...");
            retryTimeoutId = setTimeout(measureHeight, 200); // Retry delay
          }
        }
      };
      // Initial timeout wait for layout settle
      initialTimeoutId = setTimeout(measureHeight, 150); // Initial delay

      // Cleanup function for this effect instance
      return () => {
        if (initialTimeoutId) clearTimeout(initialTimeoutId);
        if (retryTimeoutId) clearTimeout(retryTimeoutId);
      };
    }
    // Depend on loading state; should re-run when loading finishes or product changes (via reset)
  }, [product, isLoading, containerMinHeight]); // Re-added containerMinHeight dependency here. If it gets reset to null, this effect should run again to measure.

  // --- Scroll Logic Effect ---
  useEffect(() => {
    // --- GUARD: Wait until height is measured and refs are ready ---
    if (
      !containerRef.current ||
      !columnARef.current ||
      !columnBRef.current ||
      !containerMinHeight // Crucial: Wait for height measurement
    ) {
      // console.log("Scroll handler waiting for refs or container minHeight...");
      return; // Don't run scroll logic yet
    }

    // --- handleScroll Definition ---
    const handleScroll = () => {
      // Re-check refs and height just in case they become null somehow
      if (
        !containerRef.current ||
        !columnARef.current ||
        !columnBRef.current ||
        !containerMinHeight
      )
        return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top + window.scrollY;
      const colA = columnARef.current;
      const colB = columnBRef.current;
      const colARect = colA.getBoundingClientRect();
      const colBRect = colB.getBoundingClientRect();
      const colAHeight = colA.offsetHeight;
      const colBHeight = colB.offsetHeight;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // --- Logging Key Values (Enable for Debugging) ---
      // console.log("--------------------");
      // console.log(`ScrollY: ${Math.round(scrollY)}`);
      // console.log(`Container Top: ${Math.round(containerTop)}`);
      // console.log(`Col A Height: ${colAHeight}, Col B Height: ${colBHeight}`);
      // console.log(`Container MinHeight State: ${containerMinHeight}`);
      // console.log(`Actual Container Height: ${containerRef.current.offsetHeight}`);

      const initialColALeft = colARect.left;
      const initialColBLeft = colBRect.left;
      const absoluteColALeft = initialColALeft - containerRect.left;
      const absoluteColBLeft = initialColBLeft - containerRect.left;

      // --- Reset Styles First ---
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

      // --- Determine which column is taller ---
      const isATaller = colAHeight > colBHeight;
      const shorterCol = isATaller ? colB : colA;
      const tallerCol = isATaller ? colA : colB;
      const shorterColHeight = isATaller ? colBHeight : colAHeight;
      const tallerColHeight = isATaller ? colAHeight : colBHeight;
      // console.log(`Is A Taller: ${isATaller}`);

      // --- Calculate Thresholds ---
      const shorterColBottomHitsViewportBottomScrollY =
        containerTop + shorterColHeight - viewportHeight;
      const tallerColBottomHitsViewportBottomScrollY =
        containerTop + tallerColHeight - viewportHeight;
      // console.log(`Shorter Hits Threshold: ${Math.round(shorterColBottomHitsViewportBottomScrollY)}`);
      // console.log(`Taller Hits Threshold: ${Math.round(tallerColBottomHitsViewportBottomScrollY)}`);

      // --- Apply Styles using clear nested logic ---
      if (scrollY < shorterColBottomHitsViewportBottomScrollY) {
        // Scenario 1: Both scroll normally. Reset is enough.
        // console.log(">>> SCENARIO 1 ACTIVE");
      } else {
        // scrollY >= shorterColBottomHitsViewportBottomScrollY
        if (scrollY < tallerColBottomHitsViewportBottomScrollY) {
          // Scenario 2: Shorter is fixed to viewport bottom, taller scrolls normally.
          // console.log(">>> SCENARIO 2 ACTIVE");
          // console.log(`   Fixing ${isATaller ? 'B' : 'A'} bottom: 0, left: ${Math.round(isATaller ? initialColBLeft : initialColALeft)}, width: ${Math.round(isATaller ? colBRect.width : colARect.width)}`);

          shorterCol.style.position = "fixed";
          shorterCol.style.bottom = "0px";
          shorterCol.style.top = "auto";
          shorterCol.style.left = `${
            isATaller ? initialColBLeft : initialColALeft
          }px`;
          shorterCol.style.width = `${
            isATaller ? colBRect.width : colARect.width
          }px`;
          shorterCol.style.zIndex = "10";
          // Ensure taller column is in normal flow
          tallerCol.style.position = "";
          tallerCol.style.zIndex = "";
        } else {
          // scrollY >= tallerColBottomHitsViewportBottomScrollY
          // Scenario 3: Both are positioned absolutely at the bottom of the container.
          // console.log(">>> SCENARIO 3 ACTIVE");
          // console.log(`   Absoluting A bottom: 0, left: ${Math.round(absoluteColALeft)}, width: ${Math.round(colARect.width)}`);
          // console.log(`   Absoluting B bottom: 0, left: ${Math.round(absoluteColBLeft)}, width: ${Math.round(colBRect.width)}`);

          colA.style.position = "absolute";
          colA.style.bottom = "0px";
          colA.style.top = "auto";
          colA.style.left = `${absoluteColALeft}px`;
          colA.style.width = `${colARect.width}px`;
          colA.style.zIndex = "10";

          colB.style.position = "absolute";
          colB.style.bottom = "0px";
          colB.style.top = "auto";
          colB.style.left = `${absoluteColBLeft}px`;
          colB.style.width = `${colBRect.width}px`;
          colB.style.zIndex = "10";
        }
      }
      // console.log("--------------------");
    }; // --- End of handleScroll ---

    const throttledScrollHandler = throttle(handleScroll, 16);
    window.addEventListener("scroll", throttledScrollHandler);

    // --- Resize Handling ---
    const handleResize = () => {
      // Reset container height so it gets remeasured by the other effect
      setContainerMinHeight(null);

      // Reset styles immediately on resize to avoid incorrect positioning
      if (columnARef.current) {
        columnARef.current.style.position = "";
        columnARef.current.style.bottom = "";
        columnARef.current.style.top = "";
        columnARef.current.style.left = "";
        columnARef.current.style.width = "";
        columnARef.current.style.zIndex = "";
      }
      if (columnBRef.current) {
        columnBRef.current.style.position = "";
        columnBRef.current.style.bottom = "";
        columnBRef.current.style.top = "";
        columnBRef.current.style.left = "";
        columnBRef.current.style.width = "";
        columnBRef.current.style.zIndex = "";
      }
      // Note: Scroll handler will re-attach/re-run once height is measured again
    };
    const throttledResizeHandler = throttle(handleResize, 150);
    window.addEventListener("resize", throttledResizeHandler);

    // --- Delayed Initial Calculation ---
    // Give content (images, etc.) more time to render after minHeight is set
    const initialScrollTimeoutId = setTimeout(() => {
      // console.log("Running delayed initial handleScroll");
      handleScroll();
    }, 150); // Adjust delay (e.g., 100, 150, 200ms)

    // --- Cleanup ---
    return () => {
      window.removeEventListener("scroll", throttledScrollHandler);
      window.removeEventListener("resize", throttledResizeHandler);
      throttledScrollHandler.cancel(); // Lodash throttle cleanup
      throttledResizeHandler.cancel(); // Lodash throttle cleanup
      clearTimeout(initialScrollTimeoutId); // Clear the initial scroll timeout
    };
    // Re-run this effect if minHeight changes (i.e., after measurement) or product/id changes
  }, [containerMinHeight, product, id]);

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

  // --- Handlers ---
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

  // --- JSX ---
  return (
    <div className="">
      {/* Outer container */}
      {/* --- Breadcrumbs --- */}
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
      {/* Apply the measured min-height to the container */}
      <div
        ref={containerRef}
        className="flex flex-col md:flex-row md:gap-8 lg:gap-12 items-start relative" // Keep relative positioning
        style={{
          minHeight: containerMinHeight ? `${containerMinHeight}px` : "auto",
        }} // Apply min-height dynamically
      >
        {/* --- Column A: Images & Description --- */}
        <div ref={columnARef} className="w-full md:w-3/5 lg:w-2/3 mb-8 md:mb-0">
          {/* Image Gallery Section */}
          <div className="flex gap-4 mb-8">
            {/* Thumbnail Column */}
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
          {/* Description / More Info Section */}
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
            {/* Using Outlet for More Info/Reviews etc. */}
            <div className="mb-12 prose max-w-none">
              <Outlet context={{ product, selectedVariantId }} />
            </div>
          </div>
        </div>{" "}
        {/* End Column A */}
        {/* --- Column B: Info & Actions --- */}
        <div ref={columnBRef} className="w-full md:w-2/5 lg:w-1/3">
          {/* Inner div for spacing */}
          <div className="space-y-4">
            {/* Name */}
            <h1 className="font-semibold text-2xl lg:text-3xl text-gray-800">
              {product.name}
            </h1>
            {/* Price Display */}
            <p className="font-semibold text-xl lg:text-2xl text-orange-600 min-h-[2rem]">
              {displayPrice.toLocaleString("vi-VN")} VND
              {selectedVariant &&
                Number(product.base_price) !== displayPrice && (
                  <span className="ml-3 text-base text-gray-500 line-through">
                    {Number(product.base_price).toLocaleString("vi-VN")} VND
                  </span>
                )}
            </p>
            {/* Variant Selection */}
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
                      className={`w-full px-4 py-2.5 border rounded-lg text-left text-sm transition-all duration-150 ease-in-out flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 ${
                        selectedVariantId === variant._id
                          ? "border-orange-500 bg-orange-50 text-orange-700 font-semibold shadow-sm ring-1 ring-orange-500"
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
          </div>{" "}
          {/* End inner space-y-4 */}
        </div>{" "}
        {/* End Column B */}
      </div>{" "}
      {/* --- End Main Layout --- */}
      {/* --- Related Products --- */}
      <div className="mt-12">
        <ProductByCategory category={product.category._id} />
      </div>
      {/* Include custom scrollbar styles if needed */}
      {/* <style jsx>{` ... `}</style> */}
    </div>
  );
};

export default Product;
