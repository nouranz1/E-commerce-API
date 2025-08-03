const express = require("express");

const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require("../Controllers/brandController");

const {
  createBrandValidator,
  getBrandValidator,
  deleteBrandValidator,
  updateBrandValidator,
} = require("../utils/validators/brandValidator");

const router = express.Router();
const AuthController = require("../Controllers/authController");

router
  .route("/")
  .get(getBrands)
  .post(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  );
router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    updateBrandValidator,
    updateBrand
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo("admin"),
    deleteBrandValidator,
    deleteBrand
  );

module.exports = router;
