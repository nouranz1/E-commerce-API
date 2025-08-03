const express = require("express");
const authController = require("../Controllers/authController");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedUserWishlist,
} = require("../Controllers/wishlistController");

const router = express.Router();
router.use(authController.protect, authController.allowedTo("user"));

router.route("/").get(getLoggedUserWishlist).post(addProductToWishlist);

router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
