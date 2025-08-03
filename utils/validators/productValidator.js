const { check, body } = require("express-validator");
const validatorMiddleware = require("../../Middlewares/validatorMiddleware");
const Category = require("../../Models/categoryModel");
const SubCategory = require("../../Models/subCategoryModel");
const { default: slugify } = require("slugify");

exports.getProductValidator = [
  // **1- rules for validation
  check("id").isInt().withMessage("Invalid product id format"),
  validatorMiddleware,
];

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3 })
    .withMessage("Product name is too short")
    .isLength({ max: 32 })
    .withMessage("Product name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 20 })
    .withMessage("Product description is too short"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),

  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Products sold count must be a number"),

  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Product price must be a valid number"),

  check("priceAfterDiscount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price after discount must be a number")
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error(
          "Price after discount must be less than original price"
        );
      }
      return true;
    }),

  check("colors")
    .optional()
    .isArray()
    .withMessage("Product colors must be an array"),

  check("images")
    .optional()
    .isArray()
    .withMessage("Product images must be an array"),

  check("categoryId")
    .notEmpty()
    .withMessage("Product category Id is required")
    .bail()
    .isInt()
    .withMessage("Invalid category Id format")
    .custom((Id) =>
      Category.findByPk(Id).then((categoryId) => {
        if (!categoryId) {
          return Promise.reject(`No category found for this id: ${Id}`);
        }
      })
    ),
  // هنا
  check("subCategoryId")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Subcategories id must be an array of at least one id")
    .bail()
    .custom((Ids) => {
      const invalid = Ids.some((Id) => !Number.isInteger(Id));
      if (invalid) {
        return Promise.reject("Invalid subcategory id format");
      }
      const hasDuplicates = new Set(Ids).size !== Ids.length;
      if (hasDuplicates) {
        return Promise.reject("Subcategory ids must not contain duplicates");
      }
      return true;
    })

    .custom(async (Ids, { req }) => {
      const result = await SubCategory.findAll({
        where: {
          id: Ids,
        },
      });

      // تحقق من أن جميع المعرفات موجودة في داتا بيز
      if (result.length !== Ids.length) {
        throw new Error("Invalid subcategories");
      }

      // تحقق أن جميع السب كاتيجوريز تتبع الكاتيجوري المحددة
      const inId = result.some(
        (subCat) => subCat.categoryId !== req.body.categoryId
      );

      if (inId) {
        return Promise.reject(
          "Some subcategories do not belong to the given category"
        );
      }
      console.log(result);

      return true;
    }),

  check("brandId").optional().isInt().withMessage("Invalid Brand id format"),

  check("ratingAverage")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating average must be a number between 1.0 and 5.0"),

  check("ratingQuantity")
    .optional()
    .isInt()
    .withMessage("Rating quantity must be an integer"),

  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isInt().withMessage("Invalid product id format"),
  check("categoryId")
    .optional()
    .isInt()
    .withMessage("Invalid category id format"),
  body("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val, { lower: true });
      return true;
    }),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isInt().withMessage("Invalid product id format"),
  validatorMiddleware,
];
