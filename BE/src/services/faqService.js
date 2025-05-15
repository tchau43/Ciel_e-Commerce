const FAQ = require('../models/faq');
const FaqCategory = require('../models/faqCategory');
const mongoose = require('mongoose');

/**
 * Create a new FAQ
 * @param {Object} faqData - FAQ data (question, answer, category, etc)
 * @returns {Promise<Object>} Created FAQ document
 */
const createFaqService = async (faqData) => {
    try {
        // Verify that the category exists
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

/**
 * Get all FAQs with optional filtering
 * @param {Object} filters - Optional filters (category, isPublished, etc)
 * @param {Object} options - Optional pagination and sorting options
 * @returns {Promise<Array>} List of FAQs
 */
const getAllFaqsService = async (filters = {}, options = {}) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = options;

        const query = { ...filters };

        // Handle category filter by slug
        if (filters.categorySlug) {
            const category = await FaqCategory.findOne({ slug: filters.categorySlug });
            if (category) {
                query.category = category._id;
            } else {
                // Return empty results if category not found
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

        // Handle category filter by name
        if (filters.categoryName) {
            // Case insensitive search for category name
            const category = await FaqCategory.findOne({
                name: { $regex: new RegExp('^' + filters.categoryName + '$', 'i') }
            });

            if (category) {
                query.category = category._id;
            } else {
                // Return empty results if category not found
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

/**
 * Get FAQ by ID
 * @param {string} faqId - FAQ document ID
 * @returns {Promise<Object>} FAQ document
 */
const getFaqByIdService = async (faqId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            throw new Error('Invalid FAQ ID format');
        }

        const faq = await FAQ.findById(faqId).populate('category');
        if (!faq) {
            throw new Error(`FAQ with ID '${faqId}' not found`);
        }

        // Increment view count but don't wait for it to complete
        faq.incrementViewCount().catch(err => {
            console.error('Error incrementing view count:', err);
        });

        return faq;
    } catch (error) {
        console.error('Error getting FAQ by ID:', error);
        throw new Error(`Error getting FAQ: ${error.message}`);
    }
};

/**
 * Update an existing FAQ
 * @param {string} faqId - FAQ document ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated FAQ document
 */
const updateFaqService = async (faqId, updateData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(faqId)) {
            throw new Error('Invalid FAQ ID format');
        }

        // Verify that the category exists if it's being updated
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

/**
 * Delete a FAQ
 * @param {string} faqId - FAQ document ID
 * @returns {Promise<Object>} Deleted FAQ document
 */
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

/**
 * Get FAQs by category
 * @param {string} categoryId - Category ID
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} List of FAQs in the category
 */
const getFaqsByCategoryService = async (categoryId, limit = 20) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid category ID format');
        }

        // Check if category exists
        const categoryExists = await FaqCategory.exists({ _id: categoryId });
        if (!categoryExists) {
            throw new Error(`Category with ID '${categoryId}' not found`);
        }

        // Thay vì gọi static method, truy vấn trực tiếp
        const faqs = await FAQ.find({
            category: categoryId,
            isPublished: true
        })
            .populate('category') // Thêm populate để lấy thông tin category
            .sort({ displayOrder: 1 })
            .limit(limit);

        return faqs;
    } catch (error) {
        console.error('Error getting FAQs by category:', error);
        throw new Error(`Error getting FAQs by category: ${error.message}`);
    }
};

/**
 * Get FAQs by category slug
 * @param {string} slug - Category slug
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} List of FAQs in the category
 */
const getFaqsByCategorySlugService = async (slug, limit = 20) => {
    try {
        // Find category by slug
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

/**
 * Search FAQs by query text
 * @param {string} searchQuery - Text to search for
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} List of matching FAQs
 */
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

/**
 * Get popular FAQs
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} List of popular FAQs
 */
const getPopularFaqsService = async (limit = 5) => {
    try {
        return await FAQ.findPopular(limit);
    } catch (error) {
        console.error('Error getting popular FAQs:', error);
        throw new Error(`Error getting popular FAQs: ${error.message}`);
    }
};

/**
 * Rate FAQ helpfulness
 * @param {string} faqId - FAQ document ID
 * @param {boolean} isHelpful - Whether the FAQ was helpful
 * @returns {Promise<Object>} Updated FAQ document
 */
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