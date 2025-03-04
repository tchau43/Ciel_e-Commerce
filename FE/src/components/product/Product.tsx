import { NavLink, Outlet } from "react-router-dom";

const Product = () => {
  return (
    <div className="">
      <p className="font-sans font-normal text-sm text-[rgba(149,148,148,1)] hover:underline mb-6">
        Sản phẩm / Đồ chơi bé gái / đồ chơi hoá trang khủng long xanh xanh xanh
        khủng long xanh dòng 03
      </p>
      <div className="bg-amber-200 w-full h-[404px] flex space-x-[12px]">
        <div className="h-full flex flex-col justify-between">
          <img className="h-1/5 w-vh" src="/logo.png"></img>
          <img className="h-1/5 w-vh" src="/logo.png"></img>
          <img className="h-1/5 w-vh" src="/logo.png"></img>
          <img className="h-1/5 w-vh" src="/logo.png"></img>
        </div>
        <div className="w-vh">
          <img className="h-full w-full" src="/logo.png"></img>
        </div>
        <div className="ml-2 max-w-[360px]">
          <p className="font-semibold text-xl">
            ĐỒ CHƠI HOÁ TRANG KHỦNG LONG XANH XANH XANH KHỦNG LONG XANH DÒNG 03
          </p>
          <div className="mt-10 space-y-4">
            <p className="text-[rgba(76,73,74,1)] text-sm font-medium">
              Simul mucius viderer no vix, semper salutatus est an. Ea vim
              facilis propriae. Ei vix falli percipitur
            </p>
            <p className="text-[rgba(76,73,74,1)] text-sm font-medium">
              Danh mục : Đồ chơi bé gái
            </p>
            <p className="text-[rgba(76,73,74,1)] text-sm font-medium">
              Tag : đồ chơi gỗ, đồ chơi thông minh
            </p>
            <div className="h-8 space-x-4 mt-10">
              <button className="bg-[rgba(213,106,54,1)] h-full min-w-40 text-[rgba(255,255,255,1)] text-[12px] font-medium hover:bg-[rgba(193,86,34,1)] hover:cursor-pointer">
                Liên hệ báo giá sỉ
              </button>
              <button className="bg-[rgba(139,192,184,1)] h-full min-w-40 text-[rgba(255,255,255,1)] text-[12px] font-medium hover:bg-[rgba(119,172,164,1)] hover:cursor-pointer">
                Đăng ký đại lý
              </button>
            </div>
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
            to={"/product/id/"}
            className="text-[rgba(76,73,74,1)] h-10 hover:cursor-pointer min-w-32"
          >
            Mô tả sản phẩm
          </NavLink>
          <NavLink
            to={"/product/id/more"}
            className="text-[rgba(76,73,74,1)] h-10 hover:cursor-pointer min-w-32"
          >
            Thông tin khác
          </NavLink>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Product;
