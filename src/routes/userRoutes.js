const express = require("express");

const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");


// middleware
const { protect } = require("../middleware/authMiddleware");



/*
=========================
 👤 USER ROUTES
=========================
*/


// Get logged-in user details
router.get(
  "/profile",
  protect,
  getUserProfile
);


// Update user details
router.put(
  "/profile",
  protect,
  updateUserProfile
);



module.exports = router;