import { useGetProductsByCategoryQuery } from "@/services/product/getProductsByCategoryQuery";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ProductCard from "@/features/components/ProductCard";
import { Product } from "@/types/dataTypes"; 

interface ProductByCategoryProps {
  category: string;
}

const ProductByCategory = ({ category }: ProductByCategoryProps) => {
  
  const {
    data: productList = [] as Product[], 
    isLoading,
    isError,
    
    error,
  } = useGetProductsByCategoryQuery(`category=${category}`);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 1, 
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 1, 
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1, 
    },
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading product data...</p>;
  }

  if (isError) {
    
    console.error("Error fetching products by category:", error);
    return (
      <p className="text-center text-red-600">
        Error loading products. Please try again.
      </p>
    );
  }

  
  if (!productList || productList.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No products found in this category.
      </p>
    );
  }

  return (
    <div>
      <Carousel
        swipeable={false}
        draggable={false}
        showDots={true}
        responsive={responsive}
        ssr={true} 
        infinite={true}
        
        autoPlay={true}
        autoPlaySpeed={2500} 
        keyBoardControl={true}
        
        customTransition="transform 500ms ease-in-out" 
        transitionDuration={500}
        containerClass="carousel-container pb-8" 
        removeArrowOnDeviceType={["tablet", "mobile"]}
        
        dotListClass="custom-dot-list-style" 
        itemClass="carousel-item px-2" 
      >
        {/* Ensure productList is correctly typed */}
        {(productList as Product[]).map((product) => (
          
          
          <ProductCard
            className="shadow-lg"
            key={product._id}
            product={product}
          /> 
        ))}
      </Carousel>
    </div>
  );
};

export default ProductByCategory;
