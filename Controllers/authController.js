const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");

const User = require("../Models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/createToken");
const { sanitizeUser } = require("../utils/sanitizeData");
const { Op } = require("sequelize");

// @desc Signup
// @route POST /api/v1/auth/signup
// @access Public
exports.signUp = asyncHandler(async (req, res, next) => {
  // 1- Create User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2- Generate token
  //   const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });
  const token = generateToken(user.id);

  res.status(201).json({ data: sanitizeUser(user), token });
});

// @desc Login
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if password and email in the body (validation)
  // 2- check if user exist & check if password is correct
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3- generate token
  const token = generateToken(user.id);
  // 4- send response to client side
  res.status(200).send({ data: user, token });
});

// @desc make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exist, if it exist get it.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not logged in, please login to access this route",
        401
      )
    );
  }

  // 2- verify token (no changes happens, expired token)
  // const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return next(new ApiError("Invalid token. Please Login again", 401));
  }
  // console.log(decoded);

  // 3- check if user exists
  const currentUser = await User.findByPk(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError("The User that belong to this token does no longer exist")
    );
  }

  // Check if user active
  if (!currentUser.active) {
    return next(new ApiError("This account has been deactivated", 403));
  }

  // 4- check if user changed his password after token created
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(passwordChangedTimestamp, decoded.iat);
    // password changed after token created
    if (passwordChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});

// @desc Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1- access rules
    // 2- access registered user
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

// @desc Forgot Password
// @Route POST /api/v1/auth/forgotPassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1- Get User by email
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    return next(
      new ApiError(`There is no user for this email: ${req.body.email} `, 404)
    );
  }
  // 2- If user exist, Generate hash random 6 digits and save it in DB.
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save Hashed password rest code to DB
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for reset code (10mins)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  // 3- send the reset code via email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid for 10 Minutes) ",
      message: `Hello ${user.name},\n\n We received a request from you to reset the password on your E-shop Acount.
\n\nYour password reset code is: ${resetCode}\n\nThis code is valid for 10 minutes.\nIf you didn't request a password reset, please ignore this message.\n\nBest regards,\nE-shop Team`,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }
  res
    .status(200)
    .json({ status: "Success", message: "Reset Code sent to your Email" });
});

// @desc Verify Password reset code
// @Route POST /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1- Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    where: {
      passwordResetCode: hashedResetCode,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    return next(new ApiError("Reset Code is invalid or expired", 404));
  }
  user.passwordResetVerified = true;
  await user.save();

  res
    .status(200)
    .json({ status: "Success", message: "Reset Code verified successfully" });
});

// @desc Reset Passwoed
// @Route PUT /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1- Get user based on email
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email ${req.body.email}`, 404)
    );
  }
  // Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset Code not verified"), 400);
  }

  user.password = req.body.newPassword;
  // مسح الاعدادات القديمة عشان ما يرجع يستعملها
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // If every thing Ok, Generate token
  const token = generateToken(user.id);
  res.status(200).json({ token });
});
