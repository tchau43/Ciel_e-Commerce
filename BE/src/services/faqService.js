const FAQ = require('../models/faq');
const mongoose = require('mongoose');

/**
 * Create a new FAQ
 * @param {Object} faqData - FAQ data (question, answer, category, etc)
 * @returns {Promise<Object>} Created FAQ document
 */
const createFaqService = async (faqData) => {
    try {
        const faq = new FAQ(faqData);
        return await faq.save();
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
    // console.log("----------getAllFaqsService");
    // console.log("----------filters", filters);
    // console.log("----------options", options);
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = options;

        const query = { ...filters };
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const skip = (page - 1) * limit;

        const faqs = await FAQ.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // console.log("----------faqs", faqs);

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

        const faq = await FAQ.findById(faqId);
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

        const faq = await FAQ.findByIdAndUpdate(
            faqId,
            updateData,
            { new: true, runValidators: true }
        );

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

        const faq = await FAQ.findByIdAndDelete(faqId);

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
 * @param {string} category - Category name
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} List of FAQs in the category
 */
const getFaqsByCategoryService = async (category, limit = 20) => {
    try {
        return await FAQ.findByCategory(category, limit);
    } catch (error) {
        console.error('Error getting FAQs by category:', error);
        throw new Error(`Error getting FAQs by category: ${error.message}`);
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
    searchFaqsService,
    getPopularFaqsService,
    rateFaqHelpfulnessService
}; 