import { useGetProductByIdQuery } from "@/services/product/getProductByIdQuery";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ProductByCategory from "./ProductByCategory";
import { useEffect, useState } from "react";
import { getAuthCredentials } from "@/utils/authUtil";
import { useAddProductToCartMutation } from "@/services/cart/addProductToCartMutation";

const Product = () => {
  const navigate = useNavigate();
  const currentUrl = window.location.href;
  const [quantity, setQuantity] = useState<number>(1);
  const { id } = useParams();
  const { mutate: updateCart, isPending } = useAddProductToCartMutation();
  const {
    data: product,
    isLoading,
    isError,
  } = useGetProductByIdQuery(id!, {
    enable: true,
  });

  useEffect(() => {
    console.log("Product currentUrl changed:", currentUrl);
  }, [currentUrl]);

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading product data...</p>;
  }

  if (isPending) {
    return <p className="text-center text-gray-600">Add to cart...</p>;
  }

  if (isError) {
    console.error("Error fetching user:", isError);
    return (
      <p className="text-center text-red-600">
        Error loading product. Please try again.
      </p>
    );
  }

  if (!product) {
    return <p className="text-center text-gray-600">Product not found.</p>;
  }

  const handleIncreaseQuantity = () => {
    setQuantity((q) => q + 1);
  };
  const handleDecreaseQuantity = () => {
    setQuantity((q) => {
      const temp = q - 1;
      return temp >= 0 ? temp : q;
    });
  };

  const handleAddToCart = () => {
    const { userInfo } = getAuthCredentials(); // retrieve user id from auth state
    console.log("userInfo", userInfo);
    const userId = userInfo._id;
    if (!userId) {
      // If the user is not logged in, you might redirect them or show a message
      navigate("/login");
      return;
    }

    updateCart({
      variables: {
        userId,
        productId: product._id,
        changeQuantity: quantity,
      },
    });
  };

  // console.log("product", product);

  return (
    <div className="">
      <p className="font-sans font-normal text-sm text-[rgba(149,148,148,1)] hover:underline mb-6 cursor-default">
        <span
          className="hover:text-[rgba(213,106,54,1)] hover:cursor-pointer"
          onClick={() => navigate("/product")}
        >
          SẢN PHẨM
        </span>
        {` `}/{` `}
        <span
          className="hover:text-[rgba(213,106,54,1)] hover:cursor-pointer"
          onClick={() => navigate(`/product?category=${product.category._id}`)}
        >
          {product.category.name}
        </span>
        {` `}/{` `}
        <span className="hover:text-[rgba(213,106,54,1)] hover:cursor-pointer">
          {product.name.toUpperCase()}
        </span>
      </p>
      <div className=" w-full h-[404px] 2xl:h-[600px] flex justify-between">
        <div className="h-full flex flex-col justify-between">
          <img className="h-1/5 aspect-square" alt="" src="/logo.png"></img>
          <img className="h-1/5 aspect-square" alt="" src="/logo.png"></img>
          <img className="h-1/5 aspect-square" alt="" src="/logo.png"></img>
          <img className="h-1/5 aspect-square" alt="" src="/logo.png"></img>
        </div>
        <div className="">
          <img
            className="h-full w-full aspect-square"
            alt=""
            src="/logo.png"
          ></img>
        </div>
        <div className="ml-2 w-fit">
          {/* <div className="ml-2 w-[360px] 2xl:w-[500px]"> */}
          <p className="font-semibold text-xl">{product.name}</p>
          <div className="mt-10 space-y-4">
            <p className="text-[rgba(76,73,74,1)] text-sm font-medium">
              {product.shortDescription}
            </p>
            <p className="text-[rgba(76,73,74,1)] text-sm font-medium">
              Danh mục: {product.category.name}
            </p>
            <p className="text-[rgba(76,73,74,1)] text-sm font-medium">
              Tag: đồ chơi gỗ, đồ chơi thông minh
            </p>
            <div className="h-8 space-x-4 mt-10">
              <button className="bg-[rgba(213,106,54,1)] h-full min-w-40 text-[rgba(255,255,255,1)] text-[12px] font-medium hover:bg-[rgba(193,86,34,1)] hover:cursor-pointer">
                Liên hệ báo giá sỉ
              </button>
              <button className="bg-[rgba(139,192,184,1)] h-full min-w-40 text-[rgba(255,255,255,1)] text-[12px] font-medium hover:bg-[rgba(119,172,164,1)] hover:cursor-pointer">
                Đăng ký đại lý
              </button>
            </div>
            <div className="flex gap-x-1 mt-10">
              <button
                className="border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                onClick={handleDecreaseQuantity}
              >
                -
              </button>
              <input
                disabled={true}
                value={quantity}
                className="border border-gray-300 text-center w-12"
              ></input>
              <button
                className="border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center"
                onClick={handleIncreaseQuantity}
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="hover:cursor-pointer text-sm font-semibold border rounded-sm px-4 py-1 bg-[rgb(84,235,117)] text-[rgb(255,255,255)] hover:bg-[rgb(64,215,7)] transition ease-in-out duration-300"
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-center">
          {/* <button className="text-[rgba(76,73,74,1)] h-10 hover:cursor-pointer min-w-32">
            Mô tả sản phẩm
          </button>
          <button className="text-[rgba(76,73,74,1)] h-10 hover:cursor-pointer min-w-32">
            Thông tin khác
          </button> */}
          <NavLink
            to={`/product/${id}/`}
            className="text-[rgba(76,73,74,1)] h-10 hover:cursor-pointer min-w-32"
          >
            Mô tả sản phẩm
          </NavLink>
          <NavLink
            to={`/product/${id}/more`}
            className="text-[rgba(76,73,74,1)] h-10 hover:cursor-pointer min-w-32"
          >
            Thông tin khác
          </NavLink>
        </div>
        <div className="mb-12">
          <Outlet />
        </div>
      </div>
      <div>
        <ProductByCategory category={product.category._id} />
      </div>
    </div>
  );
};

export default Product;
