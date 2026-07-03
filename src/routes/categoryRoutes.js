const router = require("express").Router();
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.post("/", protect, admin, createCategory);

module.exports = router;
