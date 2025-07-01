import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const LandingFooter = () => {
  const fadeInUp = {
    initial: { y: 30, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5 },
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ch-blue opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <img
                src="/CielLogo.png"
                alt="Ciel Logo"
                className="h-10 w-auto"
              />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ciel e-Commerce
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Ciel e-Commerce - Nền tảng mua sắm trực tuyến uy tín, chuyên cung
              cấp các sản phẩm công nghệ chính hãng với dịch vụ chăm sóc khách
              hàng tận tâm và chế độ bảo hành chuyên nghiệp.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">Danh mục</h3>
            <ul className="space-y-3">
              {[
                { name: "Điện thoại", href: "/products?category=phone" },
                { name: "Laptop", href: "/products?category=laptop" },
                { name: "Máy tính bảng", href: "/products?category=tablet" },
                { name: "Phụ kiện", href: "/products?category=accessories" },
                { name: "Khuyến mãi", href: "/promotions" },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <a
                    href={item.href}
                    className="hover:text-ch-blue transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-300">
                <FaMapMarkerAlt className="text-ch-blue" />
                <span>227 Nguyễn Văn Cừ, Quận 5, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaPhoneAlt className="text-ch-blue" />
                <span>1800 1234</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaEnvelope className="text-ch-blue" />
                <span>support@ciel-ecommerce.com</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Chính sách bảo hành", href: "/warranty-policy" },
                { name: "Hướng dẫn mua hàng", href: "/shopping-guide" },
                { name: "Phương thức thanh toán", href: "/payment-methods" },
                { name: "Chính sách vận chuyển", href: "/shipping-policy" },
                { name: "Trung tâm CSKH", href: "/customer-service" },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <a
                    href={item.href}
                    className="hover:text-ch-blue transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className="flex space-x-4 mt-6">
              <motion.a
                whileHover={{ y: -3 }}
                href="https://facebook.com/ciel-ecommerce"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaFacebookF className="text-white" />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href="https://twitter.com/ciel-ecommerce"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaTwitter className="text-white" />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href="https://instagram.com/ciel-ecommerce"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaInstagram className="text-white" />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href="https://youtube.com/ciel-ecommerce"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaYoutube className="text-white" />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Ciel e-Commerce. Tất cả các
              quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="/terms"
                className="text-gray-400 hover:text-white text-sm"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm"
              >
                Chính sách bảo mật
              </a>
              <a
                href="/refund"
                className="text-gray-400 hover:text-white text-sm"
              >
                Chính sách đổi trả
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default LandingFooter;
