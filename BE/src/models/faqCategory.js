const mongoose = require('mongoose');

const faqCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            unique: true,
            maxlength: [50, 'Category name cannot exceed 50 characters']
        },
        slug: {
            type: String,
            required: [true, 'Category slug is required'],
            trim: true,
            unique: true,
            lowercase: true
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters']
        },
        icon: {
            type: String,
            default: 'QuestionMarkCircledIcon'
        },
        displayOrder: {
            type: Number,
            default: 999
        },
        isActive: {
            type: Boolean,
            default: true
        },
        color: {
            type: String,
            default: 'gray'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

faqCategorySchema.index({ slug: 1 });
faqCategorySchema.index({ displayOrder: 1 });
faqCategorySchema.index({ isActive: 1 });

faqCategorySchema.virtual('faqCount', {
    ref: 'FAQ',
    localField: '_id',
    foreignField: 'category',
    count: true
});

const FaqCategory = mongoose.model('FaqCategory', faqCategorySchema);
module.exports = FaqCategory; 