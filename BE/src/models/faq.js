const mongoose = require('mongoose');

/**
 * FAQ Schema
 * Represents frequently asked questions with answers for the e-commerce platform
 */
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
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: ['shipping', 'payment', 'returns', 'product', 'account', 'general', 'other'],
                message: '{VALUE} is not a valid category'
            },
            default: 'general'
        },
        isPublished: {
            type: Boolean,
            default: true,
            required: true
        },
        displayOrder: {
            type: Number,
            default: 999, // High number by default so new items appear at the end
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
        timestamps: true, // Automatically add createdAt and updatedAt fields
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Create indexes for better performance on common queries
faqSchema.index({ category: 1 });
faqSchema.index({ isPublished: 1 });
faqSchema.index({ displayOrder: 1 });
faqSchema.index({ question: 'text', answer: 'text', tags: 'text' }); // Text search index

// Virtual for readability score calculation (Flesch-Kincaid readability)
faqSchema.virtual('readabilityScore').get(function () {
    // Basic implementation - could be expanded to use an actual algorithm
    const words = this.answer.split(/\s+/).length;
    const sentences = this.answer.split(/[.!?]+/).length;

    if (sentences === 0 || words === 0) return 0;

    // Higher score means easier to read
    return (206.835 - 1.015 * (words / sentences)).toFixed(1);
});

// Instance Method to increment view count
faqSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    return this.save();
};

// Instance Method to mark as helpful/unhelpful
faqSchema.methods.rateHelpfulness = async function (isHelpful) {
    if (isHelpful) {
        this.helpfulCount += 1;
    } else {
        this.unhelpfulCount += 1;
    }
    return this.save();
};

// Static Method to find popular FAQs
faqSchema.statics.findPopular = function (limit = 5) {
    return this.find({ isPublished: true })
        .sort({ viewCount: -1 })
        .limit(limit);
};

// Static Method to find FAQs by category
faqSchema.statics.findByCategory = function (category, limit = 20) {
    return this.find({
        category,
        isPublished: true
    })
        .sort({ displayOrder: 1 })
        .limit(limit);
};

// Static Method to search FAQs
faqSchema.statics.search = function (query, limit = 10) {
    return this.find(
        {
            $text: { $search: query },
            isPublished: true
        },
        { score: { $meta: "textScore" } } // Add text score to results
    )
        .sort({ score: { $meta: "textScore" } }) // Sort by relevance
        .limit(limit);
};

// Export the model
const FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ; 