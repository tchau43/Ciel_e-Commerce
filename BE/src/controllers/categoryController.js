const { getAllCategoriesService, createCategoryService } = require("../services/categoryService");

const getAllCategories = async (req, res) => {
    const data = await getAllCategoriesService();
    res.status(200).json(data);
}

const createCategory = async (req, res) => {
    const cateData = req.body
    const data = await createCategoryService(cateData)
    res.status(200).json(data);
}

module.exports = { getAllCategories, createCategory }