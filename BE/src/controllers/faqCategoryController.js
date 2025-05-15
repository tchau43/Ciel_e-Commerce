const {
    createFaqCategoryService,
    getAllFaqCategoriesService,
    getFaqCategoryByIdService,
    getFaqCategoryBySlugService,
    updateFaqCategoryService,
    deleteFaqCategoryService
} = require('../services/faqCategoryService');

/**
 * Create a new FAQ Category
 * @route POST /api/faq-categories
 * @access Private/Admin
 */
const createFaqCategory = async (req, res) => {
    try {
        const categoryData = req.body;
        const category = await createFaqCategoryService(categoryData);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all FAQ Categories
 * @route GET /api/faq-categories
 * @access Public
 */
const getAllFaqCategories = async (req, res) => {
    try {
        const {
            isActive = 'true',
            page,
            limit,
            sortBy,
            sortOrder,
            includeCount
        } = req.query;

        // Build filters
        const filters = {};
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        // Build options
        const options = {};
        if (page) options.page = parseInt(page, 10);
        if (limit) options.limit = parseInt(limit, 10);
        if (sortBy) options.sortBy = sortBy;
        if (sortOrder) options.sortOrder = sortOrder;
        if (includeCount) options.includeCount = includeCount === 'true';

        const result = await getAllFaqCategoriesService(filters, options);

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
 * Get a single FAQ Category by ID
 * @route GET /api/faq-categories/:id
 * @access Public
 */
const getFaqCategoryById = async (req, res) => {
    try {
        const category = await getFaqCategoryByIdService(req.params.id);

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get a single FAQ Category by slug
 * @route GET /api/faq-categories/slug/:slug
 * @access Public
 */
const getFaqCategoryBySlug = async (req, res) => {
    try {
        const category = await getFaqCategoryBySlugService(req.params.slug);

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update a FAQ Category
 * @route PUT /api/faq-categories/:id
 * @access Private/Admin
 */
const updateFaqCategory = async (req, res) => {
    try {
        const category = await updateFaqCategoryService(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete a FAQ Category
 * @route DELETE /api/faq-categories/:id
 * @access Private/Admin
 */
const deleteFaqCategory = async (req, res) => {
    try {
        const category = await deleteFaqCategoryService(req.params.id);

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(error.message.includes('not found') ? 404 : 400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createFaqCategory,
    getAllFaqCategories,
    getFaqCategoryById,
    getFaqCategoryBySlug,
    updateFaqCategory,
    deleteFaqCategory
}; 