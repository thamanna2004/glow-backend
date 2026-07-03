const cloudinary = require("../config/cloudinary");

function getImageFromFile(file) {
  if (!file) return null;

  return {
    url: file.path,
    public_id: file.filename || file.public_id || "",
  };
}

function getPublicId(image) {
  if (!image) return null;
  if (typeof image === "object" && image.public_id) {
    return image.public_id;
  }
  return null;
}

async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
  }
}

function normalizeImageField(image) {
  if (!image) return { url: "", public_id: "" };
  if (typeof image === "string") {
    return { url: image, public_id: "" };
  }
  return {
    url: image.url || "",
    public_id: image.public_id || "",
  };
}

module.exports = {
  getImageFromFile,
  getPublicId,
  deleteCloudinaryImage,
  normalizeImageField,
};
