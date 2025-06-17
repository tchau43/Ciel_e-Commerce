# Nền Tảng Thương Mại Điện Tử Ciel

Một nền tảng thương mại điện tử đầy đủ được xây dựng bằng Node.js, React TypeScript và Python cho hệ thống gợi ý sản phẩm.

## Cấu Trúc Dự Án

Dự án bao gồm bốn thành phần chính:

- `BE/` - Máy chủ API Backend (Node.js)
- `FE/` - Giao diện người dùng (React TypeScript)
- `CMS/` - Hệ thống quản lý nội dung (React TypeScript)
- `recommendation-service/` - Dịch vụ gợi ý sản phẩm (Python)

## Yêu Cầu Hệ Thống

Trước khi chạy dự án, hãy đảm bảo bạn đã cài đặt các phần mềm sau:

- Node.js (phiên bản 16 trở lên)
- Python 3.8 trở lên
- MongoDB
- npm hoặc yarn

## Hướng Dẫn Cài Đặt

### 1. Cài Đặt Backend

```bash
# Di chuyển vào thư mục backend
cd BE

# Cài đặt các gói phụ thuộc
npm install

# Tạo file .env với các biến môi trường sau:
# PORT=5000
# MONGODB_URI=đường_dẫn_mongodb_của_bạn
# JWT_SECRET=mã_bí_mật_jwt_của_bạn
# OPENAI_API_KEY=khóa_api_openai_của_bạn (cho tính năng chatbot)

# Khởi động máy chủ
npm run dev
```

### 2. Cài Đặt Frontend

```bash
# Di chuyển vào thư mục frontend
cd FE

# Cài đặt các gói phụ thuộc
npm install

# Tạo file .env với:
# VITE_API_URL=http://localhost:5000/api

# Khởi động máy chủ phát triển
npm run dev
```

### 3. Cài Đặt CMS

```bash
# Di chuyển vào thư mục CMS
cd CMS

# Cài đặt các gói phụ thuộc
npm install

# Tạo file .env với:
# VITE_API_URL=http://localhost:5000/api

# Khởi động máy chủ phát triển
npm run dev
```

### 4. Cài Đặt Dịch Vụ Gợi Ý

```bash
# Di chuyển vào thư mục dịch vụ gợi ý
cd recommendation-service

# Tạo và kích hoạt môi trường ảo (không bắt buộc nhưng được khuyến nghị)
python -m venv venv
source venv/bin/activate  # Trên Windows sử dụng: venv\Scripts\activate

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt

# Khởi động dịch vụ
python app.py
```

## Các Lệnh Có Sẵn

### Backend

- `npm run dev` - Khởi động máy chủ phát triển
- `npm start` - Khởi động máy chủ production
- `npm run seed` - Chạy các script tạo dữ liệu mẫu

### Frontend & CMS

- `npm run dev` - Khởi động máy chủ phát triển
- `npm run build` - Build cho môi trường production
- `npm run preview` - Xem trước bản build production

## Tính Năng

- Xác thực và phân quyền người dùng
- Danh mục sản phẩm với các danh mục và thương hiệu
- Chức năng giỏ hàng
- Quản lý đơn hàng
- Bảng điều khiển quản trị (CMS)
- Chatbot tích hợp AI
- Gợi ý sản phẩm thông minh
- Tích hợp thanh toán với Stripe
- Hệ thống FAQ
- Hệ thống đánh giá và xếp hạng

## Tài Liệu API

Tài liệu API có sẵn tại `http://localhost:5000/api-docs` khi máy chủ backend đang chạy.

## Đóng Góp

1. Fork dự án
2. Tạo nhánh tính năng của bạn (`git checkout -b feature/tính-năng-mới`)
3. Commit các thay đổi (`git commit -m 'Thêm một tính năng mới'`)
4. Push lên nhánh (`git push origin feature/tính-năng-mới`)
5. Tạo một Pull Request

## Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT.
