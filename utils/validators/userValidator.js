const { check, body } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const { default: slugify } = require("slugify");
const User = require("../../Models/userModel");
const bcrypt = require("bcryptjs");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required")
    .isLength({ min: 3 })
    .withMessage("User name is too short")
    .isLength({ max: 32 })
    .withMessage("User name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) => {
      User.findOne({ where: { email: val } }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      });
    }),

  check("phone")
    .optional()
    .isMobilePhone("ar-EG", "ar-SA")
    .withMessage("Invalid phone number, only accept Egy and SA Phone numbers"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("password confirmation required")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("password Confirmation incorrect");
      }
      return true;
    }),

  check("progileImg").optional(),

  check("role").optional(),
  validatorMiddleware,
];

exports.getUserValidator = [
  // **1- rules for validation
  check("id").isInt().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isInt().withMessage("Invalid user id format"),
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
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ where: { email: val } }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG", "ar-SA")
    .withMessage("Invalid phone number, only accept Egy and SA Phone numbers"),
  check("progileImg").optional(),
  check("role").optional(),

  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isInt().withMessage("Invalid user id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("You must enter your current password"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("you must enter the password confirmation"),
  check("password")
    .notEmpty()
    .withMessage("you must enter the new password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .custom(async (val, { req }) => {
      // 1- verify current password
      const user = await User.findByPk(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrent Current password");
      }
      // 2- verify password confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleware,
];

exports.updateLoggedUserValidator = [
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
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .custom((val) =>
      User.findOne({ where: { email: val } }).then((user) => {
        if (user) {
          return Promise.reject(new Error("E-mail already used"));
        }
      })
    ),
  check("phone")
    .optional()
    .isMobilePhone("ar-EG", "ar-SA")
    .withMessage("Invalid phone number, only accept Egy and SA Phone numbers"),

  validatorMiddleware,
];
