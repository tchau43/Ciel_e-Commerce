// controllers/categoryController.js

const {
    getAllCategoriesService,
    createCategoryService
} = require("../services/categoryService"); // Adjust path if needed

const getAllCategories = async (req, res) => {
    try {
        const data = await getAllCategoriesService();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error in getAllCategories controller:", error);
        // Send generic error for fetching multiple items
        res.status(500).json({ message: error.message || "Failed to retrieve categories." });
    }
};

const createCategory = async (req, res) => {
    const categoryData = req.body; // Contains data like { name: "...", description: "..." }

    try {
        // --- Input Validation ---
        const categoryName = categoryData.name;
        if (!categoryName || typeof categoryName !== 'string' || categoryName.trim().length === 0) {
            return res.status(400).json({ message: "Category name is required and must be a non-empty string." });
        }
        // --- End Validation ---

        // Call the service (which also performs duplicate checks)
        const newCategory = await createCategoryService({
            name: categoryName.trim(), // Send trimmed name
            // Pass other potential fields if your schema supports them
            // description: categoryData.description
        });

        // Use 201 Created for successful resource creation
        res.status(201).json({
            message: "Category created successfully!",
            category: newCategory
        });

    } catch (error) {
        console.error("Error in createCategory controller:", error);
        // Check for specific errors thrown by the service
        if (error.message.includes("already exists") || error.message.includes("non-empty string")) {
            // Bad Request for duplicates or validation errors from service
            res.status(400).json({ message: error.message });
        } else {
            // Generic server error for other issues
            res.status(500).json({ message: "Failed to create category." });
        }
    }
};

module.exports = {
    getAllCategories,
    createCategory
};