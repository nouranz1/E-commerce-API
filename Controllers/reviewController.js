const Reviews = require("../Models/reviewModel"); //استيراد المودل, النموذج
const factory = require("./handlersFactory");
const { User } = require("../Models");

// Nested Route
// GET /api/v1/products/:productId/reviews
exports.createFilterObject = (req, res, next) => {
  let filterObj = {};
  if (req.params.productId) {
    filterObj.productId = req.params.productId;
  }
  req.filterObj = filterObj;
  next();
};

// @desc Get all reviews OR list of reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/reviews?page=2&limit=5
// @access Public
exports.getReviews = factory.getAll(Reviews, [
  {
    model: User,
    as: "user",
    attributes: ["name"],
  },
]);

// @desc Get specific review by id
// @route GET api/v1/reviews/:id
// @access Public
exports.getReview = factory.getOne(Reviews, [
  {
    model: User,
    as: "user",
    attributes: ["name"],
  },
]);

// Nested Route (create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.productId) req.body.productId = req.params.productId;
  if (!req.body.userId) req.body.userId = req.user.id;
  next();
};

// @desc  Create review
// @route POST /api/v1/reviews
// @access Private/Protect/User
exports.createReview = factory.createOne(Reviews);

// @desc Update specific review
// @route PUT /api/v1/reviews/:id
// @access Private/Protect/User
exports.updateReview = factory.updateOne(Reviews);

// @desc Delete review
// @route DELETE /api/v1/reviews/:id
// @access Private/Protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne(Reviews);
