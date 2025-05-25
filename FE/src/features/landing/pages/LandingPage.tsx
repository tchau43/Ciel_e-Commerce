import { useNavigate } from "react-router-dom";
import { useGetFeaturedProductsQuery } from "@/services/product/getFeaturedProductsQuery";
import { useGetAllCategoriesQuery } from "@/services/category/getAllCategoriesQuery";
import { Product, Category } from "@/types/dataTypes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "@/features/components/ProductCard";
import CategoryGrid from "@/components/share/CategoryGrid";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập
  const isLoggedIn = localStorage.getItem("access_token") !== null;

  // Chuyển hướng người dùng đã đăng nhập đến trang sản phẩm
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/products");
    }
  }, [isLoggedIn, navigate]);

  // Lấy danh sách danh mục
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetAllCategoriesQuery();

  // Nếu đã đăng nhập, không cần tải dữ liệu sản phẩm
  const {
    data: featuredProducts,
    isLoading: isProductsLoading,
    error,
  } = useGetFeaturedProductsQuery({
    limit: 10,
    enabled: !isLoggedIn, // Chỉ thực hiện query khi người dùng chưa đăng nhập
  });

  // Xử lý khi người dùng click vào các action
  const handleActionClick = () => {
    // Luôn chuyển hướng đến trang đăng nhập vì trang này chỉ hiển thị cho người dùng chưa đăng nhập
    navigate("/login");
  };

  // Xử lý khi người dùng click vào danh mục
  const handleCategoryClick = (category: Category) => {
    if (isLoggedIn) {
      navigate("/login");
    } else {
      // Chuyển đến trang products với category ID
      navigate(`/products?category=${category._id}`);
    }
  };

  useEffect(() => {
    if (!isProductsLoading && !isCategoriesLoading) {
      setIsLoading(false);
    }
  }, [isProductsLoading, isCategoriesLoading]);

  // Nếu đã đăng nhập, không hiển thị trang này
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* <Header /> */}

      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Công Nghệ Đỉnh Cao Trong Tầm Tay
            </h1>
            <p className="text-xl mb-8">
              Khám phá các sản phẩm điện tử chất lượng cao với giá cả phải chăng
              và nhiều ưu đãi độc quyền.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleActionClick()}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg transition-colors"
              >
                Mua Ngay
              </button>
              <button
                onClick={() => handleActionClick()}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md font-medium text-lg transition-colors"
              >
                Xem Ưu Đãi
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://cdn2.cellphones.com.vn/x/media/catalog/product/s/a/samsung_galaxy_s24_ultra_1tb_-_1.png"
              alt="Điện thoại Samsung Galaxy S24 Ultra"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Wave pattern */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,80C160,96,320,128,480,122.7C640,117,800,75,960,64C1120,53,1280,75,1360,85.3L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <CategoryGrid
          categories={categories}
          isLoading={isCategoriesLoading}
          error={categoriesError}
          onCategoryClick={handleCategoryClick}
        />
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-2">Sản Phẩm Nổi Bật</h2>
            <p className="text-gray-600">
              Các sản phẩm được yêu thích nhất tại cửa hàng chúng tôi
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-4 space-y-4"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {featuredProducts && featuredProducts.length > 0 ? (
                  featuredProducts.map((product: Product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500">
                    Không tìm thấy sản phẩm nổi bật.
                  </div>
                )}
              </div>
              {featuredProducts && featuredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mt-12"
                >
                  <button
                    onClick={() => navigate("/products")}
                    className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300 inline-flex items-center gap-2"
                  >
                    Xem tất cả sản phẩm
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block bg-yellow-500 text-black font-bold px-4 py-1 rounded-full mb-4"
              >
                Ưu Đãi Có Hạn
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                Giảm Đến 50% Cho Tất Cả Sản Phẩm
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 mb-8"
              >
                Đừng bỏ lỡ cơ hội sở hữu những sản phẩm công nghệ hàng đầu với
                giá cực kỳ ưu đãi. Số lượng có hạn, nhanh tay đặt hàng ngay!
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onClick={() => handleActionClick()}
                className="bg-white text-gray-900 px-8 py-3 rounded-md hover:bg-gray-100 transition-colors duration-300"
              >
                Khám phá ngay
              </motion.button>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <img
                src="https://cdn2.cellphones.com.vn/x/media/catalog/product/m/a/macbook_air_m2.png"
                alt="Promotional Banner"
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nhận Xét Từ Khách Hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Nguyễn Văn A",
                role: "Kỹ sư IT",
                quote:
                  "Chất lượng sản phẩm tuyệt vời và dịch vụ giao hàng nhanh chóng. Đây là nơi tôi tin tưởng mỗi khi cần mua thiết bị điện tử.",
              },
              {
                name: "Trần Thị B",
                role: "Nhiếp ảnh gia",
                quote:
                  "Tìm được chiếc máy ảnh ưng ý với giá tốt. Đội ngũ tư vấn rất nhiệt tình và am hiểu sản phẩm.",
              },
              {
                name: "Lê Văn C",
                role: "Lập trình viên",
                quote:
                  "Laptop mua tại đây có cấu hình mạnh mẽ và ổn định. Chế độ bảo hành 2 năm giúp tôi yên tâm sử dụng.",
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt và tin tức công
            nghệ mới nhất.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Địa chỉ email của bạn"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              onClick={() => handleActionClick()}
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
