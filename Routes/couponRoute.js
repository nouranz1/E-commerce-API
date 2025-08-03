const express = require("express");

const router = express.Router();
const AuthController = require("../Controllers/authController");
const {
  getCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
  updateCoupon,
} = require("../Controllers/couponController");
const {
  createCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require("../utils/validators/couponValidator");

router.use(
  AuthController.protect,
  AuthController.allowedTo("admin", "manager")
);

router.route("/").get(getCoupons).post(createCouponValidator, createCoupon);
router
  .route("/:id")
  .get(getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
