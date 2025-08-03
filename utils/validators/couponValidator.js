const { check, body } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const { default: slugify } = require("slugify");

exports.getCouponValidator = [
  // **1- rules for validation
  check("id").isInt().withMessage("Invalid coupon id format"),
  validatorMiddleware,
];

exports.createCouponValidator = [
  check("name")
    .isUppercase()
    .withMessage("Coupon name must be upper case")
    .notEmpty()
    .withMessage("Coupon name is required")
    .isLength({ min: 3 })
    .withMessage("Coupon name is too short")
    .isLength({ max: 32 })
    .withMessage("Coupon name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check("expire")
    .isDate()
    .withMessage("Invalid Expiration date format")
    .notEmpty()
    .withMessage("Coupon expiry date is required"),
  check("discount")
    .isFloat()
    .notEmpty()
    .withMessage("Discount amount is required"),
  validatorMiddleware,
];

exports.updateCouponValidator = [
  check("id").isInt().withMessage("Invalid coupon id format"),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a valid string")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  check("expire")
    .isDate()
    .withMessage("Invalid Expiration date format")
    .notEmpty()
    .withMessage("Coupon expiry date is required"),
  check("discount")
    .isFloat()
    .notEmpty()
    .withMessage("Discount amount is required"),
  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check("id").isInt().withMessage("Invalid coupon id format"),
  validatorMiddleware,
];
