const Coupons = require("../Models/couponModel");
const factory = require("./handlersFactory");

// @desc Get all coupons OR list of coupons
// @route GET /api/v1/coupons
// @route GET /api/v1/coupons?page=2&limit=5
// @access Private/Admin-Manager
exports.getCoupons = factory.getAll(Coupons);

// @desc Get specific coupon by id
// @route GET api/v1/coupons/:id
// @access Private/Admin-Manager
exports.getCoupon = factory.getOne(Coupons);

// @desc  Create coupon
// @route POST /api/v1/coupons
// @access Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupons);

// @desc Update specific coupon
// @route PUT /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupons);

// @desc Delete coupon
// @route DELETE /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupons);
