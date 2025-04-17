// services/categoryService.js
const mongoose = require('mongoose'); // Import mongoose if needed for validation later
const Category = require("../models/category");

const createCategoryService = async (categoryData) => {
  try {
    const { name, ...otherData } = categoryData; // Extract name, keep other potential fields

    // --- ADD VALIDATION ---
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      // Throw a specific error if name is missing or not a valid string
      throw new Error('Category name is required and must be a non-empty string.');
    }
    const trimmedName = name.trim(); // Use trimmed name for checks and saving
    // --- END VALIDATION ---

    // Check if category with the same name (case-insensitive) already exists
    const existingCategory = await Category.findOne({
      // Use the validated and trimmed name in the regex
      name: { $regex: `^${trimmedName}$`, $options: "i" }, // Use ^ and $ for exact match (case-insensitive)
    });

    if (existingCategory) {
      // Throw specific error for duplicate
      throw new Error(`Category with name "${trimmedName}" already exists.`);
    } else {
      // Create new category using validated name and any other data passed
      const newCategory = new Category({
        name: trimmedName, // Save the trimmed name
        ...otherData       // Include other fields like description if passed
      });
      await newCategory.save();
      return newCategory;
    }
  } catch (error) {
    // Re-throw error, possibly distinguishing between validation/duplicate errors and others
    // The message from the new Error() thrown above will be caught here.
    throw new Error(`Error creating category: ${error.message}`);
  }
};

const getAllCategoriesService = async () => {
  try {
    const categories = await Category.find({}).lean(); // Use lean for plain objects
    return categories;
  } catch (error) {
    console.error("Error getting all categories:", error); // Log the error on the server
    throw new Error("Error getting all categories."); // Throw a generic message
  }
}

module.exports = { createCategoryService, getAllCategoriesService };