const express = require("express");
const AuthController = require("../Controllers/authController");
const reviewsRoute = require("./reviewsRoute");

const {
  getProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../Controllers/productController");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productValidator");

const router = express.Router();

// Nested Route
// POST /products/3/reviews
// GET /products/2/reviews
// GET /products/2/reviews/2
router.use("/:productId/reviews", reviewsRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
