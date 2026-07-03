const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const { skinCategoryGroups } = require("../data/skinCategories");

async function findOrCreateCategory(group) {
  let category = await Category.findOne({ name: group.name });

  if (category) {
    if (!category.slug) {
      category.slug = group.slug;
      await category.save();
    }
    return { category, created: false };
  }

  try {
    category = await Category.create({ name: group.name, slug: group.slug });
    return { category, created: true };
  } catch (error) {
    if (error.code === 11000) {
      category = await Category.findOne({ name: group.name });
      if (category && !category.slug) {
        category.slug = group.slug;
        await category.save();
      }
      return { category, created: false };
    }
    throw error;
  }
}

async function seedSkinCategories() {
  try {
    let categoriesCreated = 0;
    let subCategoriesCreated = 0;

    for (const group of skinCategoryGroups) {
      const { category, created } = await findOrCreateCategory(group);
      if (!category) continue;

      if (created) {
        categoriesCreated += 1;
      }

      for (const item of group.items) {
        let subCategory = await SubCategory.findOne({
          name: item.name,
          categoryId: category._id,
        });

        if (!subCategory) {
          subCategory = await SubCategory.create({
            name: item.name,
            slug: item.slug,
            categoryId: category._id,
          });
          subCategoriesCreated += 1;
        } else if (!subCategory.slug) {
          subCategory.slug = item.slug;
          await subCategory.save();
        }
      }
    }

    if (categoriesCreated > 0 || subCategoriesCreated > 0) {
      console.log(
        `Category seed: ${categoriesCreated} categories, ${subCategoriesCreated} subcategories added`
      );
    }
  } catch (error) {
    console.error("Category seed failed:", error.message);
  }
}

module.exports = seedSkinCategories;
