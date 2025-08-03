const SubCategory = require("../Models/subCategoryModel");
const factory = require("./handlersFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  // Nested Route
  if (!req.body.categoryId) req.body.categoryId = req.params.categoryId;
  next();
};

// Nested Route
exports.createFilterObject = (req, res, next) => {
  let filterObj = {};
  if (req.params.categoryId) {
    filterObj.categoryId = req.params.categoryId;
  }
  req.filterObj = filterObj;
  next();
};

// @desc  Create subCategory
// @route POST /api/v1/subcategories
// @access Private
exports.createSubCategory = factory.createOne(SubCategory);

// @desc Get all subCategories OR list of subcategories by categoryId
// @route GET /api/v1/subcategories
// @access Public
exports.getsubCategories = factory.getAll(SubCategory);

// @desc Get specific subcategory by id
// @route GET api/v1/subCategories/:id
// @access Public
exports.getsubCategory = factory.getOne(SubCategory);

// @desc Update specific Subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc Delete Subcategory
// @route DELETE /api/v1/subcategories/:id
// @access Private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
