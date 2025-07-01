const {
    getAllCategoriesService,
    createCategoryService
} = require("../services/categoryService");

const getAllCategories = async (req, res) => {
    try {
        const data = await getAllCategoriesService();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in getAllCategories controller:", error);
        res.status(500).json({ message: error.message || "Failed to retrieve categories." });
    }
};

const createCategory = async (req, res) => {
    const categoryData = req.body;

    try {
        const categoryName = categoryData.name;
        if (!categoryName || typeof categoryName !== 'string' || categoryName.trim().length === 0) {
            return res.status(400).json({ message: "Category name is required and must be a non-empty string." });
        }

        const newCategory = await createCategoryService({
            name: categoryName.trim(),
        });

        res.status(201).json({
            message: "Category created successfully!",
            category: newCategory
        });

    } catch (error) {
        console.error("Error in createCategory controller:", error);
        if (error.message.includes("already exists") || error.message.includes("non-empty string")) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Failed to create category." });
        }
    }
};

module.exports = {
    getAllCategories,
    createCategory
};