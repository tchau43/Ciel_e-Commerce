const mongoose = require('mongoose');
const User = require('../models/user');
const { Product } = require('../models/product');
const Invoice = require('../models/invoice');
const Variant = require('../models/variant');
require('dotenv').config({ path: 'BE/.env' }); // Use the correct path to .env file

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random number between min and max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random date between start and end
const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper to generate random address
const generateRandomAddress = () => {
    const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa'];
    const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Cầu Giấy'];
    const streets = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Lý Thái Tổ', 'Phan Chu Trinh'];

    return {
        street: `${getRandomNumber(1, 100)} ${getRandomItem(streets)}`,
        city: getRandomItem(cities),
        state: getRandomItem(districts),
        country: 'Việt Nam',
        zipCode: `${getRandomNumber(10000, 99999)}`
    };
};

const generateFakeInvoices = async (count = 35) => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all users and products
        const users = await User.find({ role: 'CUSTOMER' });
        const products = await Product.find().populate('variants');

        if (!users.length || !products.length) {
            throw new Error('No users or products found in database');
        }

        const invoices = [];
        const startDate = new Date('2024-01-01');
        const endDate = new Date();

        for (let i = 0; i < count; i++) {
            const user = getRandomItem(users);
            const orderDate = getRandomDate(startDate, endDate);

            // Generate 1-5 items for each invoice
            const itemCount = getRandomNumber(1, 5);
            const items = [];
            let subtotal = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = getRandomItem(products);
                const variant = product.variants.length ? getRandomItem(product.variants) : null;
                const quantity = getRandomNumber(1, 3);
                const priceAtPurchase = variant ? variant.price : product.base_price;

                items.push({
                    product: {
                        _id: product._id,
                        name: product.name,
                        images: product.images,
                        category: product.category,
                        brand: product.brand,
                        base_price: product.base_price
                    },
                    variant: variant ? {
                        _id: variant._id,
                        types: variant.types,
                        price: variant.price,
                        stock: variant.stock
                    } : null,
                    quantity,
                    priceAtPurchase
                });

                subtotal += priceAtPurchase * quantity;
            }

            // Random delivery fee between 15k and 50k
            const deliveryFee = getRandomNumber(15000, 50000);

            // Sometimes apply a discount (30% chance)
            const hasDiscount = Math.random() < 0.3;
            const discountAmount = hasDiscount ? Math.round(subtotal * 0.1) : 0; // 10% discount

            const totalAmount = subtotal - discountAmount + deliveryFee;

            // Determine order status based on date
            let orderStatus = 'delivered';
            let paymentStatus = 'paid';

            if (orderDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
                // If order is from last 7 days, randomize status
                const statuses = ['processing', 'shipped', 'delivered'];
                orderStatus = getRandomItem(statuses);
                if (orderStatus !== 'delivered') {
                    paymentStatus = Math.random() < 0.7 ? 'paid' : 'pending';
                }
            }

            const invoice = new Invoice({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    address: user.address,
                    image: user.image
                },
                items,
                subtotal,
                discountAmount,
                deliveryFee,
                totalAmount,
                shippingAddress: generateRandomAddress(),
                paymentMethod: getRandomItem(['CARD', 'CASH', 'BANK_TRANSFER']),
                paymentStatus,
                orderStatus,
                createdAt: orderDate,
                updatedAt: orderDate
            });

            invoices.push(invoice);
        }

        // Save all invoices
        await Invoice.insertMany(invoices);
        console.log(`Successfully generated ${count} fake invoices`);

        // Update product purchasedQuantity for delivered orders
        const deliveredInvoices = invoices.filter(inv => inv.orderStatus === 'delivered');
        for (const invoice of deliveredInvoices) {
            for (const item of invoice.items) {
                await Product.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { purchasedQuantity: item.quantity } }
                );
            }
        }
        console.log('Updated product purchase quantities');

        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error generating fake invoices:', error);
        mongoose.disconnect();
    }
};

// Run the script
generateFakeInvoices(); 