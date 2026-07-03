const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");


// ===============================
// PUBLIC ROUTES
// ===============================

// GET all products
router.get("/", getProducts);

// SEARCH products (must be before /:id)
router.get("/search", searchProducts);

// GET single product
router.get("/:id", getProductById);



// ===============================
// ADMIN ROUTES
// ===============================

// CREATE product
router.post(
  "/",
  protect,
  admin,
  upload.single("image"),
  createProduct
);

// UPDATE product
router.put(
  "/:id",
  protect,
  admin,
  upload.single("image"),
  updateProduct
);

// DELETE product
router.delete(
  "/:id",
  protect,
  admin,
  deleteProduct
);

module.exports = router;