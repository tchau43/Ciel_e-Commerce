const { getAllCategoriesService } = require("../services/categoryService");

const getAllCategories = async (req, res) => {
    const data = await getAllCategoriesService();
    res.status(200).json(data);
}

module.exports = { getAllCategories }