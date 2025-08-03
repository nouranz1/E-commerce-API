const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../Middlewares/uploadImageMiddleware");
const User = require("../Models/userModel"); //استيراد المودل, النموذج
const factory = require("./handlersFactory");
const sharp = require("sharp");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/createToken");
const bcrypt = require("bcryptjs");

// upload Single Image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image Processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(); // <-- مهم جداً

  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/users/${filename}`);

  // save image into our DB
  req.body.profileImg = filename;

  next();
});

// @desc Get all users OR list of users
// @route GET /api/v1/users
// @route GET /api/v1/users?page=2&limit=5
// @access Private/Admin
exports.getUsers = factory.getAll(User);

// @desc Get specific user by id
// @route GET api/v1/users/:id
// @access Private/Admin
exports.getUser = factory.getOne(User);

// @desc  Create user
// @route POST /api/v1/users
// @access Private/Admin
exports.createUser = factory.createOne(User);

// @desc Update specific user
// @route PUT /api/v1/users/:id
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await User.findByPk(id);
  if (!document) {
    return next(new ApiError(`No document found for this id: ${id}`, 404));
  }

  await document.update({
    name: req.body.name,
    slug: req.body.slug,
    phone: req.body.phone,
    email: req.body.email,
    profileImg: req.body.profileImg,
    role: req.body.role,
  });
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const document = await User.findByPk(id);
  if (!document) {
    return next(new ApiError(`No document found for this id: ${id}`, 404));
  }
  document.password = req.body.password;
  document.passwordChangeAt = new Date();

  await document.save();
  res.status(200).json({ data: document });
});

// @desc Delete user
// @route DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc Get Logged user data
// @route GET api/v1/users/getMe
// @access Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

// @desc Update Logged-in user password
// @route PUT api/v1/users/updateMyPassword
// @access Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  // 1- Get the logged in user data
  const user = await User.findByPk(id);
  if (!user) {
    return next(new ApiError("User Not found"));
  }
  // 2- Hash the new password and update
  user.password = await bcrypt.hash(req.body.password, 12);
  passwordChangeAt = new Date();

  await user.save();

  // 2- Generate new Token
  const token = generateToken(user.id);
  res.status(200).json({ data: user, token });
});

// @desc Update Logged-in user data (without password, role)
// @route PUT api/v1/users/updateMe
// @access Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const updatedUser = await User.findByPk(id);
  if (!updatedUser) {
    return next(new ApiError(`there is no user for this id: ${id}`, 404));
  }
  await updatedUser.update({
    name: req.body.name,
    slug: req.body.slug,
    phone: req.body.phone,
    email: req.body.email,
  });
  res.status(200).json({ data: updatedUser });
});

// @desc Deactivate Logged-in user.
// @route DELETE api/v1/users/deactiveMe
// @access Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const deleteUser = await User.findByPk(id);
  if (!deleteUser) {
    return next(new ApiError(`there is no user for this id: ${id}`, 404));
  }

  await deleteUser.update({ active: false });

  res.status(204).json({ status: "Success" });
});

// @desc Activate Logged-in user.
// @route PUT api/v1/users/activeMe
// @access Private/Protect
exports.activateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  const user = await User.findByPk(id);
  if (!user) {
    return next(new ApiError(`there is no user for this id: ${id}`, 404));
  }

  if (user.active) {
    return res.status(200).json({
      status: "Success",
      message: "Account already Active.",
    });
  }

  await user.update({ active: true });

  res.status(200).json({
    status: "Success",
    message: "Account has been reactivated successfully",
    data: user,
  });
});
