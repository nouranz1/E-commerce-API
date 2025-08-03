const { check, body } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const { default: slugify } = require("slugify");

exports.getSubCategoryValidator = [
  // **1- rules for validation
  check("id").isInt().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name is required")
    .isLength({ min: 2 })
    .withMessage("SubCategory name is too short")
    .isLength({ max: 32 })
    .withMessage("SubCategory name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check("categoryId")
    .notEmpty()
    .withMessage("subCategory must be belong to Categories")
    .isInt()
    .withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isInt().withMessage("Invalid SubCategory id format"),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a valid string")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isInt().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];
