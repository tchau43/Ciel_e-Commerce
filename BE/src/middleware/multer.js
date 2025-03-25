const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Product } = require("../models/product");

const createProductFolder = (productName) => {
  const snakeCaseName = productName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .trim();

  const productPath = path.join(
    __dirname,
    `../public/images/product/${snakeCaseName}`
  );

  if (!fs.existsSync(productPath)) {
    fs.mkdirSync(productPath, { recursive: true });
  }

  return productPath;
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId); // Assume Product is your model
      if (!product) throw new Error("Product not found");
      const productName = product.name;
      const uploadPath = createProductFolder(productName);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, PNG, and WEBP formats allowed"));
  },
});

module.exports = upload;
