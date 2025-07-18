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

const getAllFaqs = async (req, res) => {
    try {
        const {
            category,
            categorySlug,
            isPublished = 'true', 
            page,
            limit,
            sortBy,
            sortOrder
        } = req.query;

        const filters = {};
        if (category) filters.category = category;
        if (categorySlug) filters.categorySlug = categorySlug;
        if (isPublished !== undefined) filters.isPublished = isPublished === 'true';
        
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

const getFaqsByCategory = async (req, res) => {
    try {
        console.log("----------getFaqsByCategory", req.params);
        const { category } = req.params;
        const limit = parseInt(req.query.limit || 20, 10);

        let faqs;
        
        if (mongoose.Types.ObjectId.isValid(category)) {
            faqs = await getFaqsByCategoryService(category, limit);
        } else {
            try {
                faqs = await getFaqsByCategorySlugService(category, limit);
            } catch (error) {
                
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