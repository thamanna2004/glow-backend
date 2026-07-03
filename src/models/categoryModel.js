const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);