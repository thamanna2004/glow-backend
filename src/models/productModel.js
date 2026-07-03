const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    image: {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        default: "",
      },
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },

    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
