const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");

const getAdminProfile = async (req, res) => {
  res.json({
    message: "Welcome Admin",
    admin: req.user,
  });
};

const getAllUsers = async (req, res) => {
  const search = (req.query.search || "").trim();
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(filter).select("-password -refreshToken");
  res.json(users);
};

const updateUser = async (req, res) => {
  try {
    const { role, isBlocked } = req.body;
    const user = await User.findById(req.params.id).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role = role;
    }

    if (isBlocked !== undefined) {
      user.isBlocked = Boolean(isBlocked);
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find({ orderStatus: { $ne: "Cancelled" } }).select("totalAmount"),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, orderStatus } = req.body;
    const nextStatus = orderStatus || status;
    const allowed = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: nextStatus },
      { new: true }
    ).populate("userId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminProfile,
  getAllUsers,
  updateUser,
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
