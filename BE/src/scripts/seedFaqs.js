/**
 * Seed script to create sample FAQs for e-commerce platform
 * Run with: node seedFaqs.js from the project root directory
 */
require('dotenv').config({ path: 'BE/.env' }); // Use the correct path to .env file
const mongoose = require('mongoose');
const FAQ = require('../models/faq');
const FaqCategory = require('../models/faqCategory'); // Import FaqCategory model instead of Category

// Get MongoDB URI from environment or use a default value
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';

console.log('Connecting to MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected for FAQ seeding'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Sample FAQ data organized by categories
const faqData = [
    // Shipping FAQs
    {
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Thời gian giao hàng phụ thuộc vào vị trí địa lý của bạn. Đối với khu vực nội thành Hà Nội và TP. Hồ Chí Minh, thời gian giao hàng thường từ 1-2 ngày làm việc. Đối với các tỉnh thành khác, thời gian giao hàng dự kiến từ 3-5 ngày làm việc. Lưu ý rằng thời gian này không bao gồm ngày lễ, ngày nghỉ và các tình huống bất khả kháng.',
        category: 'shipping', // This will be replaced with the actual category ID
        displayOrder: 1,
        tags: ['giao hàng', 'thời gian', 'vận chuyển'],
    },
    {
        question: 'Phí vận chuyển được tính như thế nào?',
        answer: 'Phí vận chuyển được tính dựa trên khoảng cách từ kho hàng đến địa chỉ giao hàng và tổng trọng lượng của đơn hàng. Đối với đơn hàng từ 500.000đ trở lên, chúng tôi miễn phí vận chuyển cho khu vực nội thành Hà Nội và TP. Hồ Chí Minh. Đối với các khu vực khác, phí vận chuyển sẽ được hiển thị cụ thể khi bạn tiến hành thanh toán.',
        category: 'shipping',
        displayOrder: 2,
        tags: ['phí vận chuyển', 'giao hàng', 'miễn phí'],
    },
    {
        question: 'Làm thế nào để theo dõi đơn hàng của tôi?',
        answer: 'Bạn có thể theo dõi đơn hàng của mình bằng cách đăng nhập vào tài khoản và vào phần "Lịch sử mua hàng". Tại đây, bạn sẽ thấy thông tin về trạng thái đơn hàng và mã theo dõi vận chuyển (nếu có). Ngoài ra, chúng tôi cũng sẽ gửi email cập nhật trạng thái đơn hàng cho bạn khi đơn hàng được xác nhận, khi đơn hàng được giao cho đơn vị vận chuyển, và khi đơn hàng đã được giao thành công.',
        category: 'shipping',
        displayOrder: 3,
        tags: ['theo dõi đơn hàng', 'vận chuyển', 'trạng thái'],
    },

    // Payment FAQs
    {
        question: 'Có những phương thức thanh toán nào được chấp nhận?',
        answer: 'Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau bao gồm: Thanh toán khi nhận hàng (COD), Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB), Chuyển khoản ngân hàng, Ví điện tử (MoMo, ZaloPay, VNPay), và Trả góp qua thẻ tín dụng. Tất cả các giao dịch thanh toán trực tuyến đều được bảo mật bằng công nghệ mã hóa tiên tiến.',
        category: 'payment',
        displayOrder: 1,
        tags: ['thanh toán', 'COD', 'thẻ tín dụng', 'chuyển khoản'],
    },
    {
        question: 'Làm thế nào để thanh toán trả góp?',
        answer: 'Để thanh toán trả góp, bạn cần có thẻ tín dụng của một trong các ngân hàng đối tác của chúng tôi bao gồm: HSBC, Shinhan Bank, Sacombank, VPBank, và Techcombank. Khi thanh toán, chọn phương thức "Trả góp qua thẻ tín dụng" và chọn kỳ hạn trả góp (3, 6, 9, hoặc 12 tháng). Chúng tôi hỗ trợ trả góp 0% lãi suất cho đơn hàng từ 3.000.000đ trở lên. Phí chuyển đổi trả góp (nếu có) sẽ tùy thuộc vào chính sách của từng ngân hàng.',
        category: 'payment',
        displayOrder: 2,
        tags: ['trả góp', 'thẻ tín dụng', '0% lãi suất'],
    },
    {
        question: 'Khi nào tôi sẽ nhận được hóa đơn VAT?',
        answer: 'Hóa đơn VAT sẽ được cung cấp theo yêu cầu của khách hàng. Nếu bạn cần hóa đơn VAT, vui lòng chọn tùy chọn "Yêu cầu hóa đơn VAT" khi thanh toán và cung cấp đầy đủ thông tin doanh nghiệp bao gồm tên doanh nghiệp, địa chỉ, mã số thuế. Hóa đơn điện tử sẽ được gửi đến email của bạn trong vòng 3-7 ngày làm việc sau khi đơn hàng được giao thành công.',
        category: 'payment',
        displayOrder: 3,
        tags: ['hóa đơn VAT', 'hóa đơn điện tử', 'thuế'],
    },

    // Returns FAQs
    {
        question: 'Chính sách đổi trả hàng như thế nào?',
        answer: 'Chúng tôi có chính sách đổi trả trong vòng 30 ngày kể từ ngày mua hàng. Sản phẩm đổi trả phải còn nguyên vẹn, chưa qua sử dụng, còn đầy đủ bao bì, nhãn mác và hóa đơn/biên lai mua hàng. Đối với sản phẩm lỗi do nhà sản xuất, chúng tôi sẽ chịu chi phí vận chuyển cho việc đổi trả. Đối với các trường hợp khác, khách hàng sẽ chịu chi phí vận chuyển cho việc gửi trả sản phẩm.',
        category: 'returns',
        displayOrder: 1,
        tags: ['đổi trả', 'hoàn tiền', 'chính sách'],
    },
    {
        question: 'Làm thế nào để yêu cầu đổi trả sản phẩm?',
        answer: 'Để yêu cầu đổi trả sản phẩm, bạn cần thực hiện các bước sau: 1) Đăng nhập vào tài khoản của bạn, 2) Vào phần "Lịch sử mua hàng" và chọn đơn hàng cần đổi trả, 3) Nhấn vào nút "Yêu cầu đổi trả" và điền thông tin cần thiết, 4) Đợi phản hồi từ bộ phận Chăm sóc Khách hàng của chúng tôi. Sau khi yêu cầu được chấp thuận, bạn sẽ nhận được hướng dẫn về cách gửi trả sản phẩm.',
        category: 'returns',
        displayOrder: 2,
        tags: ['đổi trả', 'quy trình', 'hoàn tiền'],
    },
    {
        question: 'Mất bao lâu để nhận được tiền hoàn trả?',
        answer: 'Thời gian hoàn tiền phụ thuộc vào phương thức thanh toán ban đầu của bạn. Đối với thanh toán bằng thẻ tín dụng/ghi nợ, thời gian hoàn tiền thường từ 7-14 ngày làm việc. Đối với thanh toán qua ví điện tử, thời gian hoàn tiền thường từ 3-5 ngày làm việc. Đối với thanh toán chuyển khoản ngân hàng, thời gian hoàn tiền thường từ 5-10 ngày làm việc. Đối với thanh toán COD, chúng tôi sẽ chuyển khoản lại cho bạn trong vòng 7 ngày làm việc sau khi nhận được sản phẩm trả lại.',
        category: 'returns',
        displayOrder: 3,
        tags: ['hoàn tiền', 'thời gian', 'đổi trả'],
    },

    // Product FAQs
    {
        question: 'Làm thế nào để kiểm tra tính xác thực của sản phẩm?',
        answer: 'Tất cả các sản phẩm được bán trên trang web của chúng tôi đều là hàng chính hãng 100%. Bạn có thể kiểm tra tính xác thực của sản phẩm thông qua mã QR hoặc mã sê-ri trên bao bì sản phẩm. Quét mã QR hoặc truy cập trang web của nhà sản xuất và nhập mã sê-ri để xác minh. Ngoài ra, tất cả các sản phẩm đều đi kèm phiếu bảo hành chính hãng (nếu có) và hóa đơn mua hàng từ chúng tôi.',
        category: 'product',
        displayOrder: 1,
        tags: ['chính hãng', 'xác thực', 'bảo hành'],
    },
    {
        question: 'Chính sách bảo hành sản phẩm như thế nào?',
        answer: 'Chính sách bảo hành sẽ khác nhau tùy theo từng loại sản phẩm và nhà sản xuất. Thông thường, thời gian bảo hành từ 12 đến 24 tháng đối với các sản phẩm điện tử, và từ 6 đến 12 tháng đối với các sản phẩm khác. Thông tin bảo hành cụ thể sẽ được hiển thị trên trang chi tiết sản phẩm. Để yêu cầu bảo hành, bạn cần giữ phiếu bảo hành và hóa đơn mua hàng. Bạn có thể mang sản phẩm đến trung tâm bảo hành chính hãng hoặc liên hệ với chúng tôi để được hỗ trợ.',
        category: 'product',
        displayOrder: 2,
        tags: ['bảo hành', 'chính sách', 'sửa chữa'],
    },
    {
        question: 'Sản phẩm có được kiểm tra trước khi giao hàng không?',
        answer: 'Có, tất cả các sản phẩm đều được kiểm tra kỹ lưỡng trước khi giao hàng. Đối với các sản phẩm điện tử, chúng tôi thực hiện kiểm tra chức năng cơ bản để đảm bảo sản phẩm hoạt động bình thường. Đối với quần áo và phụ kiện, chúng tôi kiểm tra để đảm bảo không có lỗi sản xuất hoặc hư hại. Sản phẩm sau đó được đóng gói cẩn thận để đảm bảo an toàn trong quá trình vận chuyển.',
        category: 'product',
        displayOrder: 3,
        tags: ['kiểm tra', 'chất lượng', 'đóng gói'],
    },

    // Account FAQs
    {
        question: 'Làm thế nào để cập nhật thông tin tài khoản?',
        answer: 'Để cập nhật thông tin tài khoản, bạn cần đăng nhập và nhấn vào tên người dùng ở góc trên bên phải màn hình. Chọn "Thông tin tài khoản" từ menu thả xuống. Tại đây, bạn có thể cập nhật thông tin cá nhân, địa chỉ giao hàng, thay đổi mật khẩu, và quản lý phương thức thanh toán đã lưu. Sau khi thực hiện các thay đổi, nhớ nhấn "Lưu" để cập nhật thông tin.',
        category: 'account',
        displayOrder: 1,
        tags: ['tài khoản', 'cập nhật', 'thông tin cá nhân'],
    },
    {
        question: 'Làm thế nào để khôi phục mật khẩu đã quên?',
        answer: 'Nếu bạn quên mật khẩu, hãy nhấn vào liên kết "Quên mật khẩu?" trên trang đăng nhập. Nhập địa chỉ email đã đăng ký và nhấn "Gửi". Chúng tôi sẽ gửi email chứa liên kết để đặt lại mật khẩu đến địa chỉ email của bạn. Nhấn vào liên kết trong email và làm theo hướng dẫn để tạo mật khẩu mới. Liên kết đặt lại mật khẩu có hiệu lực trong 24 giờ.',
        category: 'account',
        displayOrder: 2,
        tags: ['mật khẩu', 'quên', 'đặt lại'],
    },
    {
        question: 'Làm thế nào để xóa tài khoản?',
        answer: 'Để yêu cầu xóa tài khoản, bạn cần đăng nhập và vào phần "Thông tin tài khoản". Cuộn xuống cuối trang và nhấn vào nút "Yêu cầu xóa tài khoản". Bạn sẽ được yêu cầu xác nhận quyết định và có thể cần cung cấp mật khẩu hiện tại để xác thực. Sau khi xác nhận, yêu cầu xóa tài khoản sẽ được xử lý trong vòng 30 ngày. Lưu ý rằng việc xóa tài khoản là không thể hoàn tác và tất cả dữ liệu liên quan đến tài khoản sẽ bị xóa vĩnh viễn.',
        category: 'account',
        displayOrder: 3,
        tags: ['xóa tài khoản', 'quyền riêng tư', 'dữ liệu cá nhân'],
    },

    // General FAQs
    {
        question: 'Làm thế nào để liên hệ với bộ phận chăm sóc khách hàng?',
        answer: 'Bạn có thể liên hệ với bộ phận chăm sóc khách hàng của chúng tôi thông qua nhiều kênh khác nhau: 1) Gọi đến số hotline 1900-xxxx từ 8h00 đến 20h00 hàng ngày (kể cả cuối tuần và ngày lễ), 2) Gửi email đến chaupt2823@gmail.com, thời gian phản hồi trong vòng 24 giờ làm việc, 3) Chat trực tuyến trên trang web của chúng tôi khi có biểu tượng chat hiển thị, 4) Gửi tin nhắn qua trang Facebook chính thức của chúng tôi. Chúng tôi luôn sẵn sàng hỗ trợ bạn giải quyết mọi thắc mắc và vấn đề.',
        category: 'general',
        displayOrder: 1,
        tags: ['liên hệ', 'chăm sóc khách hàng', 'hỗ trợ'],
    },
    {
        question: 'Cửa hàng có cung cấp dịch vụ gói quà không?',
        answer: 'Có, chúng tôi cung cấp dịch vụ gói quà với mức phí từ 15.000đ đến 50.000đ tùy thuộc vào kích thước sản phẩm và loại gói quà bạn chọn. Để sử dụng dịch vụ này, bạn cần chọn tùy chọn "Gói quà" trong quá trình thanh toán và chọn mẫu giấy gói, thiệp (nếu có). Bạn cũng có thể thêm lời nhắn cá nhân sẽ được in trên thiệp. Lưu ý rằng dịch vụ gói quà có thể làm tăng thời gian xử lý đơn hàng thêm 1 ngày làm việc.',
        category: 'general',
        displayOrder: 2,
        tags: ['gói quà', 'dịch vụ', 'quà tặng'],
    },
    {
        question: 'Làm thế nào để đăng ký nhận thông tin khuyến mãi?',
        answer: 'Để đăng ký nhận thông tin khuyến mãi, bạn có thể: 1) Nhập địa chỉ email của bạn vào ô đăng ký nhận bản tin ở cuối trang web và nhấn "Đăng ký", 2) Đánh dấu vào ô "Tôi muốn nhận thông tin khuyến mãi" khi tạo tài khoản hoặc thực hiện thanh toán, 3) Đăng ký thông qua trang Facebook chính thức của chúng tôi. Bạn có thể hủy đăng ký bất kỳ lúc nào bằng cách nhấn vào liên kết "Hủy đăng ký" ở cuối mỗi email hoặc thay đổi tùy chọn trong phần Thông tin tài khoản của bạn.',
        category: 'general',
        displayOrder: 3,
        tags: ['khuyến mãi', 'bản tin', 'đăng ký'],
    },
    {
        question: 'Có thể mua hàng mà không cần tạo tài khoản không?',
        answer: 'Có, bạn có thể mua hàng mà không cần tạo tài khoản bằng cách chọn tùy chọn "Mua hàng không cần đăng ký" trong quá trình thanh toán. Tuy nhiên, việc tạo tài khoản mang lại nhiều lợi ích như: lưu thông tin giao hàng và thanh toán cho lần mua sắm tiếp theo, theo dõi đơn hàng và lịch sử mua hàng, tích lũy điểm thưởng, và nhận các ưu đãi độc quyền dành cho thành viên. Việc tạo tài khoản chỉ mất vài phút và hoàn toàn miễn phí.',
        category: 'general',
        displayOrder: 4,
        tags: ['tài khoản', 'mua hàng', 'đăng ký'],
    },
];

// Function to seed the database
const seedFAQs = async () => {
    try {
        // Delete existing FAQs if needed
        await FAQ.deleteMany({});
        console.log('Deleted existing FAQs');

        // Get all categories from the database using FaqCategory model
        const categories = await FaqCategory.find();
        console.log(`Found ${categories.length} categories in the database`);

        if (categories.length === 0) {
            console.warn('No categories found in the database. FAQs will not be mapped to category IDs.');
            console.warn('Please run seedFaqCategories.js first to populate categories.');
            mongoose.connection.close();
            process.exit(1);
        }

        // Create a mapping of category slug/name to category ID
        const categoryMap = {};
        categories.forEach(category => {
            // Map both the slug and the name to handle different formats
            if (category.slug) {
                categoryMap[category.slug] = category._id;
                // Also map lowercase version for case-insensitive matching
                categoryMap[category.slug.toLowerCase()] = category._id;
            }
            if (category.name) {
                categoryMap[category.name] = category._id;
                // Also map lowercase version for case-insensitive matching
                categoryMap[category.name.toLowerCase()] = category._id;
            }
        });

        // Print categoryMap for debugging
        console.log('Category map:', categoryMap);

        // Replace category names with corresponding IDs
        const processedFaqData = faqData.map(faq => {
            const categoryValue = faq.category.toLowerCase();
            if (categoryMap[categoryValue]) {
                return {
                    ...faq,
                    category: categoryMap[categoryValue]
                };
            } else {
                console.warn(`Category "${faq.category}" not found in database. Skipping this FAQ.`);
                return null;
            }
        }).filter(faq => faq !== null); // Remove any FAQs with invalid categories

        if (processedFaqData.length === 0) {
            console.error('No valid FAQs to insert after category mapping. Check if your categories exist in the database.');
            mongoose.connection.close();
            process.exit(1);
        }

        // Insert new FAQs with proper category IDs
        const insertedFAQs = await FAQ.insertMany(processedFaqData);
        console.log(`Successfully added ${insertedFAQs.length} FAQs with proper category IDs`);

        mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding FAQs:', error);
        mongoose.connection.close();
        process.exit(1);
    }
};

// Run the seeding function
seedFAQs(); 