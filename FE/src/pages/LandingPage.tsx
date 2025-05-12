import Header from "@/features/landing/components/Header";
import { useNavigate } from "react-router-dom";
import { useGetFeaturedProductsQuery } from "@/services/product/getFeaturedProductsQuery";
import { Product } from "@/types/dataTypes";
import { useState, useEffect } from "react";

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

  // Nếu đã đăng nhập, không cần tải dữ liệu sản phẩm
  const {
    data: featuredProducts,
    isLoading: isProductsLoading,
    error,
  } = useGetFeaturedProductsQuery({
    limit: 3,
    enabled: !isLoggedIn, // Chỉ thực hiện query khi người dùng chưa đăng nhập
  });

  // Xử lý khi người dùng click vào các action
  const handleActionClick = (action: string, productId?: string) => {
    // Luôn chuyển hướng đến trang đăng nhập vì trang này chỉ hiển thị cho người dùng chưa đăng nhập
    navigate("/login");
  };

  useEffect(() => {
    if (!isProductsLoading) {
      setIsLoading(false);
    }
  }, [isProductsLoading]);

  // Format giá tiền sang định dạng VNĐ
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Tính giá khuyến mãi (tăng 5-10% so với giá gốc)
  const calculateDiscountPrice = (price: number): string => {
    const originalPrice = price * 1.07; // Tăng giá 7% để tạo hiệu ứng giảm giá
    return formatPrice(originalPrice);
  };

  // Nếu đã đăng nhập, không hiển thị trang này
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

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
                onClick={() => handleActionClick("shop")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium text-lg transition-colors"
              >
                Mua Ngay
              </button>
              <button
                onClick={() => handleActionClick("shop")}
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
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Danh Mục Sản Phẩm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                name: "Điện Thoại",
                icon: "📱",
                color: "bg-red-100",
                category: "MOBILE",
              },
              {
                name: "Laptop",
                icon: "💻",
                color: "bg-blue-100",
                category: "LAPTOP",
              },
              {
                name: "Đồng Hồ Thông Minh",
                icon: "⌚",
                color: "bg-green-100",
                category: "WATCH",
              },
            ].map((category) => (
              <div
                key={category.name}
                className={`${category.color} rounded-xl p-6 text-center cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => handleActionClick("shop")}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-medium text-lg">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-2">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Các sản phẩm được yêu thích nhất tại cửa hàng chúng tôi
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts && featuredProducts.length > 0 ? (
                featuredProducts.map((product: Product) => (
                  <div
                    key={product._id}
                    className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : "https://via.placeholder.com/400"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="font-medium text-xl mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description && product.description.length > 0
                          ? product.description[0]
                          : ""}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(product.base_price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {calculateDiscountPrice(product.base_price)}
                        </span>
                      </div>
                      <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                        onClick={() =>
                          handleActionClick("addToCart", product._id)
                        }
                      >
                        Thêm Vào Giỏ Hàng
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-500">
                  Không tìm thấy sản phẩm nổi bật.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <span className="inline-block bg-yellow-500 text-black font-bold px-4 py-1 rounded-full mb-4">
                Ưu Đãi Có Hạn
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Giảm Đến 50% Cho Tất Cả Sản Phẩm
              </h2>
              <p className="text-lg mb-6">
                Cơ hội sở hữu các thiết bị công nghệ mới nhất với giá không thể
                tốt hơn trong đợt thanh lý cuối năm!
              </p>
              <button
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md font-medium"
                onClick={() => handleActionClick("shop")}
              >
                Khám Phá Ngay
              </button>
            </div>
            <div className="md:w-2/5">
              <img
                src="https://cdn2.cellphones.com.vn/x/media/catalog/product/l/a/laptop_hp_240_g9_9e5w3pt_-_1.png"
                alt="Laptop HP 240 G9"
                className="rounded-lg"
              />
            </div>
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
              onClick={() => handleActionClick("subscribe")}
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TechZone</h3>
              <p className="text-gray-400">
                Điểm đến lý tưởng cho mọi nhu cầu công nghệ của bạn.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Sản Phẩm</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("shop");
                    }}
                  >
                    Điện Thoại
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("shop");
                    }}
                  >
                    Laptop
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("shop");
                    }}
                  >
                    Đồng Hồ Thông Minh
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("shop");
                    }}
                  >
                    Phụ Kiện
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("support");
                    }}
                  >
                    Liên Hệ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("support");
                    }}
                  >
                    Câu Hỏi Thường Gặp
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("support");
                    }}
                  >
                    Thông Tin Vận Chuyển
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("support");
                    }}
                  >
                    Chính Sách Bảo Hành
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Kết Nối</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("social");
                    }}
                  >
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("social");
                    }}
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("social");
                    }}
                  >
                    YouTube
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActionClick("social");
                    }}
                  >
                    Zalo
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} TechZone. Tất cả quyền được bảo
              lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
