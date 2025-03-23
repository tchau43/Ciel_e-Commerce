import { useGetProductsByCategoryQuery } from "@/services/product/getProductsByCategoryQuery";
import ProductIntro from "./ProductIntro";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

interface ProductByCategoryProps {
  category: string;
}

const ProductByCategory = ({ category }: ProductByCategoryProps) => {
  const {
    data: productList = [],
    isLoading,
    isError,
  } = useGetProductsByCategoryQuery(`category=${category}`);
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading product data...</p>;
  }

  if (isError) {
    console.error("Error fetching user:", isError);
    return (
      <p className="text-center text-red-600">
        Error loading product. Please try again.
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
        ssr={true} // means to render carousel on server-side.
        infinite={true}
        // autoPlay={this.props.deviceType !== "mobile" ? true : false}
        autoPlay={true}
        autoPlaySpeed={1500}
        keyBoardControl={true}
        // customTransition="all .5"
        customTransition="all 0.5s ease-in-out" // smooth transition with easing
        transitionDuration={500}
        containerClass="carousel-container pb-8"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        // deviceType={this.props.deviceType}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {productList.map((product) => (
          <div className="flex justify-center">
            <ProductIntro key={product._id} data={product} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default ProductByCategory;
