const Category = require("../models/categoryModel");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({ name });

    res.status(201).json(category);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};