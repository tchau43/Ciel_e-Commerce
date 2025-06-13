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
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-ch-blue opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                EcommerceWeb
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Nền tảng mua sắm trực tuyến hàng đầu với các sản phẩm công nghệ
              chất lượng cao, mang đến trải nghiệm mua sắm tuyệt vời nhất cho
              khách hàng.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {["Trang chủ", "Sản phẩm", "Về chúng tôi", "Liên hệ"].map(
                (item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    <a
                      href="#"
                      className="hover:text-ch-blue transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </motion.li>
                )
              )}
            </ul>
          </motion.div>

          {/* Contact Info */}
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
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaPhoneAlt className="text-ch-blue" />
                <span>(84) 123-456-789</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-300">
                <FaEnvelope className="text-ch-blue" />
                <span>contact@ecommerceweb.com</span>
              </li>
            </ul>
          </motion.div>

          {/* Social Media & Newsletter */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-white">
              Kết nối với chúng tôi
            </h3>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ y: -3 }}
                href="#"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaFacebookF className="text-white" />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href="#"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaTwitter className="text-white" />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href="#"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaInstagram className="text-white" />
              </motion.a>
              <motion.a
                whileHover={{ y: -3 }}
                href="#"
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-ch-blue transition-colors duration-300"
              >
                <FaYoutube className="text-white" />
              </motion.a>
            </div>

            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Đăng ký nhận tin</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 bg-gray-700 rounded-l-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ch-blue"
                />
                <button className="bg-ch-blue hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition-colors duration-300">
                  Đăng ký
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 EcommerceWeb. Đã đăng ký bản quyền.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default LandingFooter;
