import CategoriesList from "@/components/product/CategoriesList";
import ProductsList from "@/components/product/ProductsList";
// import { Outlet } from "react-router-dom";

const ProductPage = () => {
  return (
    <>
      <div className="size-full flex justify-between">
        <div>
          <CategoriesList />
        </div>
        <div>
          <ProductsList />
        </div>
        {/* <Outlet></Outlet> */}
      </div>
    </>
  );
};
export default ProductPage;
