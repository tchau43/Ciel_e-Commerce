const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
            minlength: [10, 'Question must be at least 10 characters long'],
            maxlength: [500, 'Question cannot exceed 500 characters']
        },
        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true,
            minlength: [10, 'Answer must be at least 10 characters long'],
            maxlength: [2000, 'Answer cannot exceed 2000 characters']
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FaqCategory',
            required: [true, 'Category is required']
        },
        isPublished: {
            type: Boolean,
            default: true,
            required: true
        },
        displayOrder: {
            type: Number,
            default: 999,
        },
        viewCount: {
            type: Number,
            default: 0
        },
        helpfulCount: {
            type: Number,
            default: 0
        },
        unhelpfulCount: {
            type: Number,
            default: 0
        },
        tags: [{
            type: String,
            trim: true,
        }],
        relatedFaqs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FAQ'
        }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

faqSchema.index({ category: 1 });
faqSchema.index({ isPublished: 1 });
faqSchema.index({ displayOrder: 1 });
faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

faqSchema.virtual('readabilityScore').get(function () {
    const words = this.answer.split(/\s+/).length;
    const sentences = this.answer.split(/[.!?]+/).length;

    if (sentences === 0 || words === 0) return 0;

    return (206.835 - 1.015 * (words / sentences)).toFixed(1);
});

faqSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    return this.save();
};

faqSchema.methods.rateHelpfulness = async function (isHelpful) {
    if (isHelpful) {
        this.helpfulCount += 1;
    } else {
        this.unhelpfulCount += 1;
    }
    return this.save();
};

faqSchema.statics.findPopular = function (limit = 5) {
    return this.find({ isPublished: true })
        .sort({ viewCount: -1 })
        .populate('category')
        .limit(limit);
};

faqSchema.statics.findByCategory = function (categoryId, limit = 20) {
    return this.find({
        category: categoryId,
        isPublished: true
    })
        .sort({ displayOrder: 1 })
        .populate('category')
        .limit(limit);
};

faqSchema.statics.search = function (query, limit = 10) {
    return this.find(
        {
            $text: { $search: query },
            isPublished: true
        },
        { score: { $meta: "textScore" } }
    )
        .populate('category')
        .sort({ score: { $meta: "textScore" } })
        .limit(limit);
};

const FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ; 