const express = require("express");
const router = express.Router();
const { protect, admin, optionalProtect } = require("../middleware/authMiddleware");
const {
  chat,
  getProfile,
  updateProfile,
  analytics,
  trackProductClick,
} = require("../controllers/aiController");

router.post("/chat", optionalProtect, chat);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/track-click", optionalProtect, trackProductClick);
router.get("/analytics", protect, admin, analytics);

module.exports = router;
