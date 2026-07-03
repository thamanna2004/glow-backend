const mongoose = require("mongoose");

const aiChatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    intent: { type: String, default: "general" },
    replyPreview: { type: String, default: "" },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    clickedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiChatLog", aiChatLogSchema);
