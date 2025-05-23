require('dotenv').config({ path: 'BE/.env' }); // Use the correct path to .env file
const mongoose = require('mongoose');
const CustomerHomePage = require('../models/customerHomePage');

const migration = {
    async up() {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Đã kết nối đến database');

            // Tìm document homepage hiện tại
            const homepage = await CustomerHomePage.findOne();

            if (!homepage) {
                console.log('Không tìm thấy homepage để cập nhật');
                return;
            }

            // Cập nhật với features mới
            homepage.features = [
                {
                    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
                    title: "Miễn phí Vận chuyển",
                    description: "Áp dụng cho mọi đơn hàng từ 500.000đ trên toàn quốc. Đặt hàng hôm nay, nhận hàng ngay ngày mai."
                },
                {
                    image_url: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800",
                    title: "Ưu đãi Sinh viên",
                    description: "Giảm thêm 5% cho sinh viên khi mua laptop và máy tính bảng. Áp dụng cả với sản phẩm đang giảm giá."
                },
                {
                    image_url: "https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=800",
                    title: "Trả góp 0%",
                    description: "Mua trước trả sau với lãi suất 0% trong 6 tháng đầu. Áp dụng cho đơn hàng từ 3 triệu đồng."
                },
                {
                    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
                    title: "Thu cũ Đổi mới",
                    description: "Lên đời smartphone với ưu đãi thu cũ đổi mới, nhận ngay voucher giảm giá đến 2 triệu đồng."
                }
            ];

            await homepage.save();
            console.log('Đã cập nhật features thành công');

        } catch (error) {
            console.error('Lỗi khi cập nhật features:', error);
            throw error;
        } finally {
            await mongoose.disconnect();
            console.log('Đã ngắt kết nối database');
        }
    },

    async down() {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Đã kết nối đến database');

            // Tìm document homepage hiện tại
            const homepage = await CustomerHomePage.findOne();

            if (!homepage) {
                console.log('Không tìm thấy homepage để rollback');
                return;
            }

            // Reset về mảng rỗng hoặc features mặc định
            homepage.features = [];

            await homepage.save();
            console.log('Đã rollback features thành công');

        } catch (error) {
            console.error('Lỗi khi rollback features:', error);
            throw error;
        } finally {
            await mongoose.disconnect();
            console.log('Đã ngắt kết nối database');
        }
    }
};

// Chạy migration khi được gọi trực tiếp từ command line
if (require.main === module) {
    const command = process.argv[2];
    if (command === 'up') {
        migration.up()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } else if (command === 'down') {
        migration.down()
            .then(() => process.exit(0))
            .catch(error => {
                console.error(error);
                process.exit(1);
            });
    } else {
        console.log('Vui lòng chỉ định "up" hoặc "down"');
        process.exit(1);
    }
}

module.exports = migration; 