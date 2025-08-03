const express = require("express");

const {
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewsValidator");

// const {
//   createBrandValidator,
//   getBrandValidator,
//   deleteBrandValidator,
//   updateBrandValidator,
// } = require("../utils/validators/brandValidator");

const {
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  createFilterObject,
  setProductIdAndUserIdToBody,
} = require("../Controllers/reviewController");

const AuthController = require("../Controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObject, getReviews)
  .post(
    AuthController.protect,
    AuthController.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route("/:id")
  .get(getReview)
  .put(
    AuthController.protect,
    AuthController.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    AuthController.protect,
    AuthController.allowedTo("admin", "manager", "user"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
