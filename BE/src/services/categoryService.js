const Category = require("../models/category");

const createCategoryService = async (categoryData) => {
  try {
    const { name, ...otherData } = categoryData;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Category name is required and must be a non-empty string.');
    }
    const trimmedName = name.trim();

    const existingCategory = await Category.findOne({
      name: { $regex: `^${trimmedName}$`, $options: "i" },
    });

    if (existingCategory) {
      throw new Error(`Category with name "${trimmedName}" already exists.`);
    } else {
      const newCategory = new Category({
        name: trimmedName,
        ...otherData
      });
      await newCategory.save();
      return newCategory;
    }
  } catch (error) {
    throw new Error(`Error creating category: ${error.message}`);
  }
};

const getAllCategoriesService = async () => {
  try {
    const categories = await Category.find({}).lean();
    return categories;
  } catch (error) {
    console.error("Error getting all categories:", error);
    throw new Error("Error getting all categories.");
  }
}

module.exports = { createCategoryService, getAllCategoriesService };