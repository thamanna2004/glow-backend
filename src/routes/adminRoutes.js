const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getAdminProfile,
  updateUser,
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminController");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/profile", protect, admin, getAdminProfile);
router.get("/stats", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.patch("/users/:id", protect, admin, updateUser);
router.get("/orders", protect, admin, getAllOrders);
router.patch("/orders/:id/status", protect, admin, updateOrderStatus);
router.get("/categories", protect, admin, getAllCategories);
router.put("/categories/:id", protect, admin, updateCategory);
router.delete("/categories/:id", protect, admin, deleteCategory);

module.exports = router;
