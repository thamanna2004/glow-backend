const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");
const {
  getImageFromFile,
  getPublicId,
  deleteCloudinaryImage,
  normalizeImageField,
} = require("../utils/cloudinaryHelper");

function assignObjectId(value, fallback) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return fallback;
  }
  return value;
}

const POPULATE_FIELDS = "name slug";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeDiscountPrice(price, discount) {
  const value = Number(discount || 0);
  if (!value) return Number(price);
  return Math.round(Number(price) - (Number(price) * value) / 100);
}

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function formatProduct(product) {
  const doc = product.toObject ? product.toObject() : product;
  const image = normalizeImageField(doc.image);
  const category = doc.categoryId;
  const subCategory = doc.subCategoryId;
  const price = Number(doc.price);
  const discount = Number(doc.discount || 0);

  return {
    ...doc,
    image,
    images: image?.url ? [{ url: image.url, public_id: image.public_id || "" }] : [],
    category: category?.name || "",
    subCategory: subCategory?.name || "",
    categoryId: category?._id || doc.categoryId,
    subCategoryId: subCategory?._id || doc.subCategoryId,
    groupSlug: category?.slug || "",
    subCategorySlug: subCategory?.slug || "",
    discountPrice: computeDiscountPrice(price, discount),
    stock: doc.countInStock ?? 0,
    rating: doc.rating ?? 4.5,
    tags: doc.tags || [],
    brand: "Glow Skin",
  };
}

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      categoryId,
      subCategoryId,
      countInStock,
      rating,
      tags,
    } = req.body;

    if (!name || !description || !price || !categoryId || !subCategoryId) {
      return res.status(400).json({
        message: "Please fill all required product fields",
      });
    }

    const image = getImageFromFile(req.file);
    if (!image?.url) {
      return res.status(400).json({
        message: "Product image is required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discount: Number(discount || 0),
      categoryId,
      subCategoryId,
      countInStock: Number(countInStock || 0),
      rating: Number(rating || 4.5),
      tags: parseTags(tags),
      image,
    });

    const populated = await Product.findById(product._id)
      .populate("categoryId", POPULATE_FIELDS)
      .populate("subCategoryId", POPULATE_FIELDS);

    res.status(201).json({
      message: "Product created successfully",
      product: formatProduct(populated),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();

    if (!query) {
      return res.json({ products: [], count: 0 });
    }

    const regex = new RegExp(escapeRegex(query), "i");

    const [matchingCategories, matchingSubCategories] = await Promise.all([
      Category.find({ name: regex }).select("_id name"),
      SubCategory.find({ name: regex }).select("_id name"),
    ]);

    const categoryIds = matchingCategories.map((item) => item._id);
    const subCategoryIds = matchingSubCategories.map((item) => item._id);

    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { tags: regex },
        { categoryId: { $in: categoryIds } },
        { subCategoryId: { $in: subCategoryIds } },
      ],
    })
      .populate("categoryId", POPULATE_FIELDS)
      .populate("subCategoryId", POPULATE_FIELDS)
      .sort({ createdAt: -1 })
      .limit(60);

    const formatted = products.map((product) => formatProduct(product));

    res.json({
      products: formatted,
      count: formatted.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("categoryId", POPULATE_FIELDS)
      .populate("subCategoryId", POPULATE_FIELDS)
      .sort({ createdAt: -1 });

    res.json(products.map(formatProduct));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", POPULATE_FIELDS)
      .populate("subCategoryId", POPULATE_FIELDS);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(formatProduct(product));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;

    product.price =
      req.body.price !== undefined ? Number(req.body.price) : product.price;

    product.discount =
      req.body.discount !== undefined
        ? Number(req.body.discount)
        : product.discount;

    product.categoryId = assignObjectId(req.body.categoryId, product.categoryId);
    product.subCategoryId = assignObjectId(
      req.body.subCategoryId,
      product.subCategoryId
    );

    product.countInStock =
      req.body.countInStock !== undefined
        ? Number(req.body.countInStock)
        : product.countInStock;

    if (req.body.rating !== undefined) {
      product.rating = Number(req.body.rating);
    }

    if (req.body.tags !== undefined) {
      product.tags = parseTags(req.body.tags);
    }

    if (req.file) {
      const oldPublicId = getPublicId(product.image);
      const newImage = getImageFromFile(req.file);
      product.image = newImage;
      if (oldPublicId && oldPublicId !== newImage.public_id) {
        await deleteCloudinaryImage(oldPublicId);
      }
    }

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id)
      .populate("categoryId", POPULATE_FIELDS)
      .populate("subCategoryId", POPULATE_FIELDS);

    res.json({
      message: "Product updated",
      product: formatProduct(populated),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const publicId = getPublicId(product.image);
    await deleteCloudinaryImage(publicId);
    await product.deleteOne();

    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
};
