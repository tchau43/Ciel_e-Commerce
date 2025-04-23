import { useGetHomePageQuery } from "@/services/homePage/getHomePageQuery";
import { useState } from "react";
import Carousel from "react-multi-carousel";

const CustomerHomePage = () => {
  const { data: homePageData } = useGetHomePageQuery();
  const [isHovered, setIsHovered] = useState(false);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  return (
    <div className="p-10">
      {/* Hero Banner Section */}
      <div className="w-full bg-gray-100 rounded-lg mb-8">
        <img
          className="w-full h-auto object-cover rounded-lg aspect-[2/1]"
          src={homePageData?.banners[0].photo_url}
          alt="Hero Banner"
        />
      </div>

      {/* Videos Section */}
      <div className="mb-12">
        <Carousel
          swipeable={false}
          draggable={false}
          showDots={true}
          responsive={responsive}
          ssr={true}
          infinite={true}
          autoPlay={!isHovered} // Pause autoplay on hover
          autoPlaySpeed={1500}
          keyBoardControl={true}
          // customTransition="all 1.5s ease-in-out"
          transitionDuration={500}
          removeArrowOnDeviceType={["tablet", "mobile"]}
          partialVisible={false} // Add this
          shouldResetAutoplay={false}
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-40-px px-3"
          containerClass="carousel-container pb-8 -mx-3"
        >
          {Array.isArray(homePageData?.videos) &&
          homePageData?.videos.length > 0 ? (
            homePageData?.videos.map((video, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg aspect-[5/4]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <a
                  href={video.video_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                >
                  <img
                    src={video.photo_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="flex items-center justify-center">
                    <div className="absolute top-4/5 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-gradient-to-br bg-black w-4/5 py-2 rounded-lg">
                      <h3 className="text-white text-sm md:text-xl font-semibold drop-shadow-md transform transition-all duration-300 hover:scale-110 hover:text-gray-100">
                        {video.title}
                      </h3>
                    </div>
                  </div>
                </a>
              </div>
            ))
          ) : (
            <div>Loading videos...</div>
          )}
        </Carousel>
      </div>

      {/* Recommend Products Section */}
      {/* Uncomment if you want to display recommended products */}
      {/* <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Hàng Mới Về</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {homePageData?.products?.map((product, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{product.name}</h3>
                <p className="text-gray-600">{product.short_description}</p>
                <p className="text-lg font-bold mt-2">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* Feature Section (Policies, etc.) */}
      <div className="flex justify-between w-full gap-x-5">
        {homePageData?.features.map((f, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-full sm:w-[2/7] gap-y-3"
          >
            <img src={f.image_url} alt={f.title} className="w-16 h-16" />
            <div className="font-semibold text-center text-md text-gray-300">
              {f.title}
            </div>
            <div className="text-sm text-center text-gray-300">
              {f.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerHomePage;
