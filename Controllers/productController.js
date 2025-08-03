const multer = require("multer");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");

const Product = require("../Models/productModel"); //استيراد المودل, النموذج
const User = require("../Models/userModel");
const Reviews = require("../Models/reviewModel");
const Category = require("../Models/categoryModel");

const factory = require("./handlersFactory");
const { uploadMixOfImages } = require("../Middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files) return next(); // <-- مهم جداً

  console.log(req.files);
  //   Image Processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuidv4()}-${Date.now()}.cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFilename}`);

    // save image into our DB
    req.body.imageCover = imageCoverFilename;
  }

  //   image Processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}.${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // save image into our DB
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

// @desc Get all products OR list of products And filter them
// @route GET /api/v1/products
// @route GET /api/v1/products?page=2&limit=5
// @access Public
exports.getProducts = factory.getAll(Product, [
  {
    model: Category,
    as: "category",
    attributes: ["name"],
  },
]);

// @desc Get specific product by id
// @route GET api/v1/products/:id
// @access Public
exports.getProduct = factory.getOne(Product, [
  {
    model: Category,
    as: "category",
    attributes: ["name", "id"],
  },
  {
    model: Reviews,
    as: "reviews",
    attributes: ["title", "ratings"],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"],
      },
    ],
  },
]);

// @desc  Create product
// @route POST /api/v1/products
// @access Private
exports.createProduct = factory.createOne(Product);

// @desc Update specific product
// @route PUT /api/v1/products/:id
// @access Private
exports.updateProduct = factory.updateOne(Product);

// @desc Delete product
// @route DELETE /api/v1/products/:id
// @access Private
exports.deleteProduct = factory.deleteOne(Product);
