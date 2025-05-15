const {
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
} = require('../services/faqService');
const mongoose = require('mongoose');

/**
 * Create a new FAQ
 * @route POST /api/faqs
 * @access Private/Admin
 */
const createFaq = async (req, res) => {
    try {
        const faqData = req.body;
        const faq = await createFaqService(faqData);
        res.status(201).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all FAQs with optional filters
 * @route GET /api/faqs
 * @access Public
 */
const getAllFaqs = async (req, res) => {
    try {
        const {
            category,
            categorySlug,
            isPublished = 'true', // Default to only published FAQs for public access
            page,
            limit,
            sortBy,
            sortOrder
        } = req.query;

        // Build filters
        const filters = {};
        if (category) filters.category = category;
        if (categorySlug) filters.categorySlug = categorySlug;
        if (isPublished !== undefined) filters.isPublished = isPublished === 'true';
        // console.log("----------filters", filters);
        // Build options
        const options = {};
        if (page) options.page = parseInt(page, 10);
        if (limit) options.limit = parseInt(limit, 10);
        if (sortBy) options.sortBy = sortBy;
        if (sortOrder) options.sortOrder = sortOrder;

        const result = await getAllFaqsService(filters, options);

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get a single FAQ by ID
 * @route GET /api/faqs/:id
 * @access Public
 */
const getFaqById = async (req, res) => {
    try {
        const faq = await getFaqByIdService(req.params.id);
        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update an existing FAQ
 * @route PUT /api/faqs/:id
 * @access Private/Admin
 */
const updateFaq = async (req, res) => {
    try {
        const faq = await updateFaqService(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete a FAQ
 * @route DELETE /api/faqs/:id
 * @access Private/Admin
 */
const deleteFaq = async (req, res) => {
    try {
        const faq = await deleteFaqService(req.params.id);
        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get FAQs by category ID or name
 * @route GET /api/faqs/category/:category
 * @access Public
 */
const getFaqsByCategory = async (req, res) => {
    try {
        console.log("----------getFaqsByCategory", req.params);
        const { category } = req.params;
        const limit = parseInt(req.query.limit || 20, 10);

        let faqs;
        // Check if the parameter is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(category)) {
            // If it's a valid ID, use getFaqsByCategoryService
            faqs = await getFaqsByCategoryService(category, limit);
        } else {
            // If it's not a valid ID, try to find by category name or slug
            // First try to find category by slug
            try {
                faqs = await getFaqsByCategorySlugService(category, limit);
            } catch (error) {
                // If not found by slug, try to find by handling it in getAllFaqsService
                const result = await getAllFaqsService(
                    {
                        categoryName: category,
                        isPublished: true
                    },
                    { limit }
                );
                faqs = result.faqs;
            }
        }

        res.status(200).json({
            success: true,
            count: faqs.length,
            faqs: faqs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get FAQs by category slug
 * @route GET /api/faqs/category-slug/:slug
 * @access Public
 */
const getFaqsByCategorySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const limit = parseInt(req.query.limit || 20, 10);

        const faqs = await getFaqsByCategorySlugService(slug, limit);

        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Search FAQs
 * @route GET /api/faqs/search/:query
 * @access Public
 */
const searchFaqs = async (req, res) => {
    try {
        const { query } = req.params;
        const limit = parseInt(req.query.limit || 10, 10);

        const faqs = await searchFaqsService(query, limit);

        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get popular FAQs
 * @route GET /api/faqs/popular
 * @access Public
 */
const getPopularFaqs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit || 5, 10);
        const faqs = await getPopularFaqsService(limit);

        res.status(200).json({
            success: true,
            count: faqs.length,
            data: faqs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Rate FAQ helpfulness
 * @route POST /api/faqs/:id/rate
 * @access Public
 */
const rateFaqHelpfulness = async (req, res) => {
    try {
        const { id } = req.params;
        const { isHelpful } = req.body;

        if (isHelpful === undefined) {
            return res.status(400).json({
                success: false,
                message: 'isHelpful field is required'
            });
        }

        const faq = await rateFaqHelpfulnessService(id, isHelpful);

        res.status(200).json({
            success: true,
            data: {
                helpfulCount: faq.helpfulCount,
                unhelpfulCount: faq.unhelpfulCount
            }
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createFaq,
    getAllFaqs,
    getFaqById,
    updateFaq,
    deleteFaq,
    getFaqsByCategory,
    getFaqsByCategorySlug,
    searchFaqs,
    getPopularFaqs,
    rateFaqHelpfulness
}; 