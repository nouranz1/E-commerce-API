const { check, body } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const Reviews = require("../../Models/reviewModel");
const User = require("../../Models/userModel");
const Product = require("../../Models/productModel");

exports.getReviewValidator = [
  // **1- rules for validation
  check("id").isInt().withMessage("Invalid review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("Ratings value can't be null")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating value must be between 1 and 5"),
  check("userId")
    .isInt()
    .withMessage("Invalid user Id format")
    .custom(async (val) => {
      const user = await User.findByPk(val);
      if (!user) {
        return Promise.reject(new Error("User not found"));
      }
    }),
  check("productId")
    .isInt()
    .withMessage("Invalid Product Id format")
    .custom(async (val, { req }) => {
      const product = await Product.findByPk(val);
      if (!product) {
        return Promise.reject(new Error("Product not found"));
      }
      // Check if logged user create a review before
      const reviewExists = await Reviews.findOne({
        where: { userId: req.body.userId, productId: val },
      });
      if (reviewExists) {
        return Promise.reject(
          new Error("You have already reviewd this product")
        );
      }
    }),
  validatorMiddleware,
];

exports.updateReviewValidator = [
  check("id")
    .isInt()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) => {
      // check review ownership before update
      if (req.user.role === "user") {
        return Reviews.findByPk(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with id ${val}`)
            );
          }
          if (review.userId.toString() !== req.user.id.toString()) {
            return Promise.reject(
              new Error(`You are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isInt()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) => {
      // check review ownership before update
      if (req.user.role === "user") {
        return Reviews.findByPk(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`There is no review with this id: ${val}`)
            );
          }
          if (review.userId.toString() !== req.user.id.toString()) {
            return Promise.reject(
              new Error(`You are not allowed to perform this action`)
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleware,
];
