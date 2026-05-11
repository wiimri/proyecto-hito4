const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
const postsUploadDir = path.join(uploadsRoot, "posts");

fs.mkdirSync(postsUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, postsUploadDir);
  },
  filename: (request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40);
    callback(null, `${Date.now()}-${safeName || "imagen"}${extension}`);
  },
});

function imageFileFilter(request, file, callback) {
  if (!file.mimetype.startsWith("image/")) {
    return callback(new Error("Solo se permiten archivos de imagen"));
  }
  return callback(null, true);
}

const uploadPostImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 6,
  },
}).array("images", 6);

function normalizePostImages(request, response, next) {
  const uploadedImages = (request.files || []).map((file, index) => ({
    imageUrl: `/uploads/posts/${file.filename}`,
    altText: request.body.title || file.originalname,
    isCover: index === 0,
  }));

  if (uploadedImages.length > 0) {
    request.body.images = uploadedImages;
    return next();
  }

  if (typeof request.body.images === "string") {
    try {
      request.body.images = JSON.parse(request.body.images);
    } catch (error) {
      return response.status(400).json({
        message: "Datos invalidos",
        errors: ["El campo images debe ser un JSON valido"],
      });
    }
  }

  return next();
}

module.exports = {
  uploadPostImages,
  normalizePostImages,
};
