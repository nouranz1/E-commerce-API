const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const { uploadSingleImage } = require("../Middlewares/uploadImageMiddleware");
const Brand = require("../Models/brandModel"); //استيراد المودل, النموذج
const factory = require("./handlersFactory");

// upload Single Image
exports.uploadBrandImage = uploadSingleImage("image");

// Image Processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // <-- مهم جداً

  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/brands/${filename}`);

  // save image into our DB
  req.body.image = filename;

  next();
});

// @desc Get all brands OR list of brands
// @route GET /api/v1/brands
// @route GET /api/v1/brands?page=2&limit=5
// @access Public
exports.getBrands = factory.getAll(Brand);

// @desc Get specific brand by id
// @route GET api/v1/brands/:id
// @access Public
exports.getBrand = factory.getOne(Brand);

// @desc  Create brand
// @route POST /api/v1/brands
// @access Private
exports.createBrand = factory.createOne(Brand);

// @desc Update specific brand
// @route PUT /api/v1/brands/:id
// @access Private
exports.updateBrand = factory.updateOne(Brand);

// @desc Delete brand
// @route DELETE /api/v1/brands/:id
// @access Private
exports.deleteBrand = factory.deleteOne(Brand);
