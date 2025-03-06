const Category = require("../models/category");

const createCategoryService = async (categoryData) => {
  try {
    const { name } = categoryData;
    const existingCategory = await Category.findOne({
      name: { $regex: name, $options: "i" },
    });

    if (existingCategory) {
      throw new Error(`Category with name "${name}" already exists.`);
    } else {
      const newCategory = new Category(categoryData);
      await newCategory.save();
      return newCategory;
    }
  } catch (error) {
    throw new Error("Error creating category: " + error.message);
  }
};

const getAllCategoriesService = async () => {
  try {
    const categories = await Category.find({});
    return categories;
  } catch (error) {
    throw new Error("Error get all categories: " + error.message);
  }
}

module.exports = { createCategoryService, getAllCategoriesService };
