const express = require("express");

const router = express.Router();
const AuthController = require("../Controllers/authController");
const {
  addProductToCart,
  getLoggedUserCart,
  removeItemFromCart,
  clearUserCart,
  updateCartItemQuantity,
  applyCopouns,
} = require("../Controllers/cartController");

router.use(AuthController.protect, AuthController.allowedTo("user"));

router
  .route("/")
  .get(getLoggedUserCart)
  .post(addProductToCart)
  .delete(clearUserCart);

router.put("/applyCoupon", applyCopouns);

router.route("/:itemId").put(updateCartItemQuantity).delete(removeItemFromCart);

module.exports = router;
