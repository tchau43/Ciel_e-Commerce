const FAQ = require('../models/faq');
const FaqCategory = require('../models/faqCategory');
const mongoose = require('mongoose');

const createFaqService = async (faqData) => {
    try {
        if (faqData.category) {
            const categoryExists = await FaqCategory.exists({ _id: faqData.category });
            if (!categoryExists) {
                throw new Error(`Category with ID '${faqData.category}' not found`);
            }
        }

        const faq = new FAQ(faqData);
        await faq.save();
        return await FAQ.findById(faq._id).populate('category');
    } catch (error) {
        console.error('Error creating FAQ:', error);
        throw new Error(`Error creating FAQ: ${error.message}`);
    }
};

const getAllFaqsService = async (filters = {}, options = {}) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = options;

        const query = { ...filters };

        if (filters.categorySlug) {
            const category = await FaqCategory.findOne({ slug: filters.categorySlug });
            if (category) {
                query.category = category._id;
            } else {
                return {
                    faqs: [],
                    totalFaqs: 0,
                    currentPage: page,
                    totalPages: 0,
                    limit
                };
            }
            delete query.categorySlug;
        }

        if (filters.categoryName) {
            const category = await FaqCategory.findOne({
                name: { $regex: new RegExp('^' + filters.categoryName + '$', 'i') }
            });

            if (category) {
                query.category = category._id;
            } else {
                return {
                    faqs: [],
                    totalFaqs: 0,
                    currentPage: page,
                    totalPages: 0,
                    limit
                };
            }
            delete query.categoryName;
        }

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const skip = (page - 1) * limit;

        const faqs = await FAQ.find(query)
            .populate('category')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await FAQ.countDocuments(query);

        return {
            faqs,
            totalFaqs: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            limit
        };
    } catch (error) {
        console.error('Error getting FAQs:', error);
        throw new Error(`Error getting FAQs: ${error.message}`);
    }
};

const getFaqByIdService = async (faqId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            throw new Error('Invalid FAQ ID format');
        }

        const faq = await FAQ.findById(faqId).populate('category');
        if (!faq) {
            throw new Error(`FAQ with ID '${faqId}' not found`);
        }

        faq.incrementViewCount().catch(err => {
            console.error('Error incrementing view count:', err);
        });

        return faq;
    } catch (error) {
        console.error('Error getting FAQ by ID:', error);
        throw new Error(`Error getting FAQ: ${error.message}`);
    }
};

const updateFaqService = async (faqId, updateData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            throw new Error('Invalid FAQ ID format');
        }

        if (updateData.category) {
            const categoryExists = await FaqCategory.exists({ _id: updateData.category });
            if (!categoryExists) {
                throw new Error(`Category with ID '${updateData.category}' not found`);
            }
        }

        const faq = await FAQ.findByIdAndUpdate(
            faqId,
            updateData,
            { new: true, runValidators: true }
        ).populate('category');

        if (!faq) {
            throw new Error(`FAQ with ID '${faqId}' not found`);
        }

        return faq;
    } catch (error) {
        console.error('Error updating FAQ:', error);
        throw new Error(`Error updating FAQ: ${error.message}`);
    }
};

const deleteFaqService = async (faqId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            throw new Error('Invalid FAQ ID format');
        }

        const faq = await FAQ.findByIdAndDelete(faqId).populate('category');

        if (!faq) {
            throw new Error(`FAQ with ID '${faqId}' not found`);
        }

        return faq;
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        throw new Error(`Error deleting FAQ: ${error.message}`);
    }
};

const getFaqsByCategoryService = async (categoryId, limit = 20) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid category ID format');
        }

        const categoryExists = await FaqCategory.exists({ _id: categoryId });
        if (!categoryExists) {
            throw new Error(`Category with ID '${categoryId}' not found`);
        }

        const faqs = await FAQ.find({
            category: categoryId,
            isPublished: true
        })
            .populate('category')
            .sort({ displayOrder: 1 })
            .limit(limit);

        return faqs;
    } catch (error) {
        console.error('Error getting FAQs by category:', error);
        throw new Error(`Error getting FAQs by category: ${error.message}`);
    }
};

const getFaqsByCategorySlugService = async (slug, limit = 20) => {
    try {
        const category = await FaqCategory.findOne({ slug });
        if (!category) {
            throw new Error(`Category with slug '${slug}' not found`);
        }

        return await FAQ.findByCategory(category._id, limit);
    } catch (error) {
        console.error('Error getting FAQs by category slug:', error);
        throw new Error(`Error getting FAQs by category slug: ${error.message}`);
    }
};

const searchFaqsService = async (searchQuery, limit = 10) => {
    try {
        if (!searchQuery || searchQuery.trim().length < 3) {
            throw new Error('Search query must be at least 3 characters long');
        }

        return await FAQ.search(searchQuery, limit);
    } catch (error) {
        console.error('Error searching FAQs:', error);
        throw new Error(`Error searching FAQs: ${error.message}`);
    }
};

const getPopularFaqsService = async (limit = 5) => {
    try {
        return await FAQ.findPopular(limit);
    } catch (error) {
        console.error('Error getting popular FAQs:', error);
        throw new Error(`Error getting popular FAQs: ${error.message}`);
    }
};

const rateFaqHelpfulnessService = async (faqId, isHelpful) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            throw new Error('Invalid FAQ ID format');
        }

        const faq = await FAQ.findById(faqId);

        if (!faq) {
            throw new Error(`FAQ with ID '${faqId}' not found`);
        }

        await faq.rateHelpfulness(isHelpful);
        return faq;
    } catch (error) {
        console.error('Error rating FAQ helpfulness:', error);
        throw new Error(`Error rating FAQ helpfulness: ${error.message}`);
    }
};

module.exports = {
    createFaqService,
    getAllFaqsService,
    getFaqByIdService,
    updateFaqService,
    deleteFaqService,
    getFaqsByCategoryService,
    getFaqsByCategorySlugService,
    searchFaqsService,
    getPopularFaqsService,
    rateFaqHelpfulnessService
};