const FaqCategory = require('../models/faqCategory');
const mongoose = require('mongoose');

const createFaqCategoryService = async (categoryData) => {
    try {
        if (!categoryData.slug && categoryData.name) {
            categoryData.slug = categoryData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const category = new FaqCategory(categoryData);
        return await category.save();
    } catch (error) {
        console.error('Error creating FAQ Category:', error);
        throw new Error(`Error creating FAQ Category: ${error.message}`);
    }
};

const getAllFaqCategoriesService = async (filters = {}, options = {}) => {
    try {
        const {
            page = 1,
            limit = 50,
            sortBy = 'displayOrder',
            sortOrder = 'asc',
            includeCount = false
        } = options;

        const query = { ...filters };
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const skip = (page - 1) * limit;

        let categoriesQuery = FaqCategory.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        if (includeCount) {
            categoriesQuery = categoriesQuery.populate('faqCount');
        }

        const categories = await categoriesQuery;
        const total = await FaqCategory.countDocuments(query);

        return {
            categories,
            totalCategories: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            limit
        };
    } catch (error) {
        console.error('Error getting FAQ Categories:', error);
        throw new Error(`Error getting FAQ Categories: ${error.message}`);
    }
};

const getFaqCategoryByIdService = async (categoryId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid FAQ Category ID format');
        }

        const category = await FaqCategory.findById(categoryId);
        if (!category) {
            throw new Error(`FAQ Category with ID '${categoryId}' not found`);
        }

        return category;
    } catch (error) {
        console.error('Error getting FAQ Category by ID:', error);
        throw new Error(`Error getting FAQ Category: ${error.message}`);
    }
};

const getFaqCategoryBySlugService = async (slug) => {
    try {
        const category = await FaqCategory.findOne({ slug });
        if (!category) {
            throw new Error(`FAQ Category with slug '${slug}' not found`);
        }

        return category;
    } catch (error) {
        console.error('Error getting FAQ Category by slug:', error);
        throw new Error(`Error getting FAQ Category: ${error.message}`);
    }
};

const updateFaqCategoryService = async (categoryId, updateData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid FAQ Category ID format');
        }

        if (updateData.name && !updateData.slug) {
            updateData.slug = updateData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const category = await FaqCategory.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) {
            throw new Error(`FAQ Category with ID '${categoryId}' not found`);
        }

        return category;
    } catch (error) {
        console.error('Error updating FAQ Category:', error);
        throw new Error(`Error updating FAQ Category: ${error.message}`);
    }
};

const deleteFaqCategoryService = async (categoryId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid FAQ Category ID format');
        }

        const category = await FaqCategory.findByIdAndDelete(categoryId);

        if (!category) {
            throw new Error(`FAQ Category with ID '${categoryId}' not found`);
        }

        return category;
    } catch (error) {
        console.error('Error deleting FAQ Category:', error);
        throw new Error(`Error deleting FAQ Category: ${error.message}`);
    }
};

module.exports = {
    createFaqCategoryService,
    getAllFaqCategoriesService,
    getFaqCategoryByIdService,
    getFaqCategoryBySlugService,
    updateFaqCategoryService,
    deleteFaqCategoryService
};