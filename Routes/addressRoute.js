const express = require("express");
const authController = require("../Controllers/authController");

const router = express.Router();
const {
  addAddress,
  removeAddress,
  getLoggedUserAddress,
} = require("../Controllers/addressController");

router.use(authController.protect, authController.allowedTo("user"));

router.route("/").post(addAddress).get(getLoggedUserAddress);

router.delete("/:addressId", removeAddress);

module.exports = router;
