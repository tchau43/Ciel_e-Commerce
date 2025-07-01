require('dotenv').config();
const mongoose = require('mongoose');

async function migrateProducts() {
    const url = process.env.MONGODB_URI;
    if (!url) {
        throw new Error('Environment variable MONGODB_URI must be set');
    }

    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    const products = await db.collection('products').find().toArray();

    for (const oldProduct of products) {
        let brandId = null;
        if (oldProduct.brand) {
            const { value: brand } = await db.collection('brands').findOneAndUpdate(
                { name: oldProduct.brand },
                { $setOnInsert: { name: oldProduct.brand } },
                { upsert: true, returnDocument: 'after' }
            );
            brandId = brand._id;
        }

        const defaultVariant = {
            types: 'default',
            price: oldProduct.price,
            images: oldProduct.images || [],
        };

        const newProduct = {
            name: oldProduct.name,
            base_price: oldProduct.price,
            description: [oldProduct.shortDescription, oldProduct.description].filter(Boolean),
            category: oldProduct.category,
            tags: oldProduct.tags || [],
            brand: brandId,
            variants: [defaultVariant],
            images: oldProduct.images || [],
            popularity: oldProduct.popularity || 0,
            url: oldProduct.moreInfomation || '',
            productIndex: oldProduct.productIndex,
            createdAt: oldProduct.createdAt,
            updatedAt: new Date(),
        };

        await db.collection('products').updateOne(
            { _id: oldProduct._id },
            { $set: newProduct },
            { bypassDocumentValidation: true }
        );
    }

    await db.collection('products').updateMany(
        {},
        {
            $unset: {
                price: "",
                shortDescription: "",
                status: "",
                quantity_in_stock: "",
                moreInfomation: ""
            }
        }
    );

    await mongoose.disconnect();
    console.log('Migration completed successfully!');
}

migrateProducts().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
