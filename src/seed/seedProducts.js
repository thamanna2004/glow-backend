const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const { skinCategoryGroups } = require("../data/skinCategories");
const { buildCatalogProducts } = require("../data/catalogProducts");

async function seedProducts() {
  try {
    const catalog = buildCatalogProducts(skinCategoryGroups);
    let created = 0;

    for (const item of catalog) {
      const category = await Category.findOne({
        $or: [{ slug: item.groupSlug }, { name: item.groupName }],
      });
      const subCategory = await SubCategory.findOne({
        categoryId: category?._id,
        $or: [{ slug: item.subCategorySlug }, { name: item.subCategoryName }],
      });

      if (!category || !subCategory) {
        continue;
      }

      const exists = await Product.findOne({
        name: item.name,
        subCategoryId: subCategory._id,
      });

      if (exists) {
        continue;
      }

      await Product.create({
        name: item.name,
        description: item.description,
        price: item.price,
        discount: item.discount,
        categoryId: category._id,
        subCategoryId: subCategory._id,
        image: item.image,
        rating: item.rating,
        countInStock: item.countInStock,
        tags: item.tags,
      });
      created += 1;
    }

    if (created > 0) {
      console.log(`Product seed: ${created} products added`);
    }
  } catch (error) {
    console.error("Product seed failed:", error.message);
  }
}

module.exports = seedProducts;
