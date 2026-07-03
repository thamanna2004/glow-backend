const SubCategory = require("../models/subCategoryModel");
const Category = require("../models/categoryModel");

// CREATE SUBCATEGORY
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({
        message: "Name and categoryId are required",
      });
    }

    // ✅ Check category exists
    const categoryExists = await Category.findById(categoryId);

    if (!categoryExists) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Optional: prevent duplicate subcategory under same category
    const exists = await SubCategory.findOne({
      name,
      categoryId,
    });

    if (exists) {
      return res.status(400).json({
        message: "SubCategory already exists in this category",
      });
    }

    const subCategory = await SubCategory.create({
      name,
      categoryId,
    });

    res.status(201).json(subCategory);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
exports.getSubCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }

    const subCategories = await SubCategory.find(filter)
      .populate("categoryId", "name")
      .sort({ name: 1 });

    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};