const mongoose = require("mongoose");

const skinProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    skinType: {
      type: String,
      enum: ["dry", "oily", "combination", "sensitive", ""],
      default: "",
    },
    concerns: [{ type: String }],
    preferences: { type: String, default: "" },
    allergies: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SkinProfile", skinProfileSchema);
