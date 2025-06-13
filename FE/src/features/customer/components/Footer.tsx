import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 w-full min-w-full">
      {/* Main Footer */}
      <div className="w-full max-w-[1440px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="space-y-4 md:pr-8">
            <img className="h-12" src="/CLogo.png" alt="Ciel Store Logo" />
            <p className="text-sm text-gray-400 leading-relaxed">
              Ciel Store - Nơi công nghệ gặp gỡ phong cách. Chúng tôi cung cấp
              các sản phẩm công nghệ chính hãng với dịch vụ khách hàng tận tâm.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:px-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Liên Kết Nhanh
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/policy"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Chính Sách Bảo Hành
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:px-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Danh Mục Sản Phẩm
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products?category=phone"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Điện Thoại
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=laptop"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Laptop
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=watch"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Đồng Hồ Thông Minh
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=accessories"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Phụ Kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:pl-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Thông Tin Liên Hệ
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-5 flex-shrink-0 mr-3">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm leading-normal">
                  64 Tổ 6 Nhân Trạch, Phường Phú Lương, Quận Hà Đông, Thành Phố
                  Hà Nội
                </p>
              </li>
              <li className="flex items-start">
                <div className="w-5 flex-shrink-0 mr-3">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <a
                  href="tel:0392031915"
                  className="text-sm hover:text-primary transition-colors"
                >
                  039.203.1915
                </a>
              </li>
              <li className="flex items-start">
                <div className="w-5 flex-shrink-0 mr-3">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <a
                  href="mailto:chaupt2823@gmail.com"
                  className="text-sm hover:text-primary transition-colors"
                >
                  chaupt2823@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 w-full">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Ciel Store. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-400 hover:text-primary transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
