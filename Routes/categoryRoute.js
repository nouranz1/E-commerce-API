const express = require("express");
const router = express.Router();
const subcategoriesRoute = require("./subCategoryRoute");

// استيراد دوال الكنترولر
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../Controllers/categoryController");

const AuthController = require("../Controllers/authController");

// استيراد دوال التحقق من صحة البيانات
const {
  createCategoryValidator,
  getCategoryValidator,
  deleteCategoryValidator,
  updateCategoryValidator,
} = require("../utils/validators/categoryValidator");

// Nested Route
router.use("/:categoryId/subcategories", subcategoriesRoute);

// إنشاء تصنيف جديد
// router.get('/', getCategories)
// router.post('/', createCategory);
// OR
router
  .route("/")
  .get(getCategories)
  .post(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
