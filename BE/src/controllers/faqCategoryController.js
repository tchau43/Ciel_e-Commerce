const {
    createFaqCategoryService,
    getAllFaqCategoriesService,
    getFaqCategoryByIdService,
    getFaqCategoryBySlugService,
    updateFaqCategoryService,
    deleteFaqCategoryService
} = require('../services/faqCategoryService');

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

        const filters = {};
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

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