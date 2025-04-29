import { useGetProductsByCategoryQuery } from "@/services/product/getProductsByCategoryQuery";
// Removed ProductIntro import as it's not used
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ProductCard from "@/features/components/ProductCard";
import { Product } from "@/types/dataTypes"; // Import Product type

interface ProductByCategoryProps {
  category: string;
}

const ProductByCategory = ({ category }: ProductByCategoryProps) => {
  // Specify the type for productList using the imported Product type
  const {
    data: productList = [] as Product[], // Default to an empty typed array
    isLoading,
    isError,
    // Removed unused 'error' variable, added it back to align with original code structure
    error,
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
    // Use the 'error' variable in the console log
    console.error("Error fetching products by category:", error);
    return (
      <p className="text-center text-red-600">
        Error loading products. Please try again.
      </p>
    );
  }

  // Add a check for empty product list after loading and no error
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
        ssr={true} // means to render carousel on server-side.
        infinite={true}
        // autoPlay={this.props.deviceType !== "mobile" ? true : false}
        autoPlay={true}
        autoPlaySpeed={2500} // Slightly slower speed
        keyBoardControl={true}
        // customTransition="all .5"
        customTransition="transform 500ms ease-in-out" // Standard transform transition
        transitionDuration={500}
        containerClass="carousel-container pb-8" // Ensure padding-bottom for dots
        removeArrowOnDeviceType={["tablet", "mobile"]}
        // deviceType={this.props.deviceType} // Usually passed from props if needed
        dotListClass="custom-dot-list-style" // Class for styling dots
        itemClass="carousel-item px-2" // Add padding between items
      >
        {/* Ensure productList is correctly typed */}
        {(productList as Product[]).map((product) => (
          // Added key directly to ProductCard as it's the element being mapped
          // Removed the wrapping div as ProductCard is likely the root element needed for layout
          <ProductCard
            className="shadow-lg"
            key={product._id}
            product={product}
          /> // Changed 'data' prop to 'product'
        ))}
      </Carousel>
    </div>
  );
};

export default ProductByCategory;
