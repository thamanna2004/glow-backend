const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../config/cloudinary");


// ===============================
// CLOUDINARY STORAGE CONFIG
// ===============================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: {
    folder: "products",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    transformation: [
      {
        width: 800,
        height: 800,
        crop: "limit",
        background: "#f8f6f2",
      },
    ],
  },
});


// ===============================
// FILE FILTER (VALIDATION)
// ===============================
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
  }
};


// ===============================
// MULTER CONFIG
// ===============================
const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

module.exports = upload;