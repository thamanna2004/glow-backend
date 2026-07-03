const SkinProfile = require("../models/skinProfileModel");
const { processChat, getAnalytics } = require("../services/aiService");

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?._id;

    const result = await processChat({ message, userId, history });

    res.json({
      reply: result.reply,
      products: result.products || [],
      intent: result.intent,
    });
  } catch (error) {
    console.error("AI chat error:", error.message);
    res.status(500).json({ message: "Glow AI is temporarily unavailable. Please try again." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await SkinProfile.findOne({ userId: req.user._id }).lean();
    res.json(profile || { skinType: "", concerns: [], preferences: "", allergies: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { skinType, concerns, preferences, allergies } = req.body;
    const profile = await SkinProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        skinType: skinType || "",
        concerns: Array.isArray(concerns) ? concerns : [],
        preferences: preferences || "",
        allergies: Array.isArray(allergies) ? allergies : [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.analytics = async (req, res) => {
  try {
    const data = await getAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackProductClick = async (req, res) => {
  try {
    const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "productId required" });
    const AiChatLog = require("../models/aiChatLogModel");
    const log = await AiChatLog.findOne({ userId: req.user?._id }).sort({ createdAt: -1 });
    if (log) {
      log.clickedProductIds = [...(log.clickedProductIds || []), productId];
      await log.save();
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
};
