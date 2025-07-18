require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const User = require('../../models/user');
const { Product } = require('../../models/product');
const Invoice = require('../../models/invoice');

const NUM_INVOICES_TO_CREATE = 20;

async function seedInvoices() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    try {
        console.log('Fetching existing users and products...');
        const users = await User.find().select('_id').limit(50).lean();
        const products = await Product.find().select('_id base_price name').limit(100).lean();

        if (users.length === 0 || products.length === 0) {
            console.error('Error: Need existing users and products in the database to create invoices.');
            return;
        }

        console.log(`Found ${users.length} users and ${products.length} products.`);
        console.log(`Attempting to create ${NUM_INVOICES_TO_CREATE} invoices...`);

        const invoicesToCreate = [];
        const paymentStatuses = ["pending", "paid", "failed", "refunded"];
        const paymentMethods = ["COD", "Stripe", "Other"];

        for (let i = 0; i < NUM_INVOICES_TO_CREATE; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const numItems = faker.number.int({ min: 1, max: 5 });
            const invoiceItems = [];
            let calculatedTotalAmount = 0;
            const usedProductIndices = new Set();

            for (let j = 0; j < numItems; j++) {
                if (usedProductIndices.size >= products.length) break;

                let productIndex;
                do {
                    productIndex = Math.floor(Math.random() * products.length);
                } while (usedProductIndices.has(productIndex));
                usedProductIndices.add(productIndex);

                const randomProduct = products[productIndex];
                const quantity = faker.number.int({ min: 1, max: 3 });
                const priceAtPurchase = randomProduct.base_price || faker.commerce.price({ min: 5, max: 1000, dec: 2 });

                invoiceItems.push({
                    product: randomProduct._id,
                    quantity: quantity,
                    priceAtPurchase: priceAtPurchase,
                });
                calculatedTotalAmount += quantity * priceAtPurchase;
            }

            if (invoiceItems.length === 0) {
                console.warn("Skipping invoice creation as no items could be added.");
                continue;
            }

            const randomStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
            const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

            const shippingAddress = {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state({ abbreviated: true }),
                country: faker.location.countryCode('alpha-3'),
                zipCode: faker.location.zipCode(),
            };

            let paymentIntentId = null;
            if (randomMethod === 'Stripe' && randomStatus === 'paid') {
                paymentIntentId = `pi_${faker.string.alphanumeric({ length: 24, casing: 'lower' })}`;
            }

            const invoiceData = {
                user: randomUser._id,
                items: invoiceItems,
                totalAmount: parseFloat(calculatedTotalAmount.toFixed(2)),
                paymentStatus: randomStatus,
                paymentMethod: randomMethod,
                shippingAddress: shippingAddress,
                paymentIntentId: paymentIntentId,
            };

            invoicesToCreate.push(invoiceData);
            console.log(`Prepared invoice ${i + 1}/${NUM_INVOICES_TO_CREATE} (Method: ${randomMethod}, Status: ${randomStatus})`);
        }

        if (invoicesToCreate.length > 0) {
            console.log(`Inserting ${invoicesToCreate.length} invoices into the database...`);
            await Invoice.insertMany(invoicesToCreate);
            console.log(`Successfully created ${invoicesToCreate.length} fake invoices!`);
        } else {
            console.log("No invoices were generated to insert.");
        }
    } catch (error) {
        console.error('Error seeding invoices:', error);
    } finally {
        console.log('Closing MongoDB connection.');
        await mongoose.disconnect();
    }
}

seedInvoices();