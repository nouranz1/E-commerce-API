const express = require("express");
const AuthController = require("../Controllers/authController");

// mergeParams: true => allows us to access params on other routers
// ex: we need to access categoryId from category router
const router = express.Router({ mergeParams: true }); // to use params from parent route

const {
  createSubCategory,
  getsubCategories,
  getsubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObject,
} = require("../Controllers/subCategoryController");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
  deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

router
  .route("/")
  .post(setCategoryIdToBody, createSubCategoryValidator, createSubCategory)
  .get(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    createFilterObject,
    getsubCategories
  );
router
  .route("/:id")
  .get(getSubCategoryValidator, getsubCategory)
  .put(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo("admin"),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

router.route("/category/:categoryId/subcategories").get(getsubCategories);

module.exports = router;
