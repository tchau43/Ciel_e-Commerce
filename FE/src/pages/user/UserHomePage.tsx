import { useGetHomePageQuery } from "@/services/homePage/getHomePageQuery";
import { useState } from "react";
import Carousel from "react-multi-carousel";

const UserHomePage = () => {
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
    <div className="p-4">
      {/* Hero Banner Section */}
      <div className="w-full bg-gray-100 rounded-lg mb-8">
        <img
          className="w-full h-auto object-cover rounded-lg"
          src={homePageData?.banners[0].photo_url}
          alt="Hero Banner"
        />
        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl md:text-3xl font-semibold">
          {homePageData?.banners[0]?.text || "Default Text"}
        </div> */}
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
          autoPlay={!isHovered}
          autoPlaySpeed={1500}
          keyBoardControl={true}
          customTransition="all 1.5s ease-in-out"
          transitionDuration={500}
          containerClass="carousel-container pb-8"
          removeArrowOnDeviceType={["tablet", "mobile"]}
          dotListClass="custom-dot-list-style"
          itemClass="carousel-item-padding-40-px"
        >
          {homePageData?.videos.map((video, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden p-4"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img
                src={video.photo_url}
                alt={video.title}
                className="w-full object-cover rounded-lg aspect-[3/2]"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{video.title}</h3>
                <a
                  href={video.video_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 mt-2 inline-block"
                >
                  Watch Video
                </a>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* Featured Products Section */}
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

      {/* Footer Section (Policies, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold">DẠNG SẢN PHẨM</h3>
          <p className="text-gray-600 mt-2">
            Lorem ipsum dolor sit amet, ad dico ridens ius, eu possit
            accommodare eos primis.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold">CHÍNH SÁCH HỖ TRỢ TỐT</h3>
          <p className="text-gray-600 mt-2">
            Lorem ipsum dolor sit amet, ad dico ridens ius, eu possit
            accommodare eos primis.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold">UY TÍN VÀ TÍNH PHÁP LÝ</h3>
          <p className="text-gray-600 mt-2">
            Lorem ipsum dolor sit amet, ad dico ridens ius, eu possit
            accommodare eos primis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserHomePage;
