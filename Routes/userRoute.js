const express = require("express");
const AuthController = require("../Controllers/authController");

const {
  getUser,
  uploadUserImage,
  resizeImage,
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  activateUser,
} = require("../Controllers/userController");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const router = express.Router();

router.use(AuthController.protect);

router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",
  changeUserPasswordValidator,
  updateLoggedUserPassword
);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deactiveMe", deleteLoggedUserData);
router.delete("/activeMe", activateUser);

// Admin
router.use(AuthController.allowedTo("admin", "manager", "user"));

router.put(
  "/changeMyPassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
