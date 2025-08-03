const asyncHandler = require("express-async-handler");

const User = require("../Models/userModel");
const ApiError = require("../utils/apiError");
const Address = require("../Models/addressModel");

// @desc  Add Address to user addresses list
// @route POST /api/v1/addresses
// @access Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  if (!userId) {
    return next(new ApiError("User ID is required", 400));
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  const { phone, alias, details, country, city, street, postCode } = req.body;

  if (
    !phone ||
    !alias ||
    !details ||
    !country ||
    !city ||
    !street ||
    !postCode
  ) {
    return next(new ApiError("All address fields are required", 400));
  }
  const addresesData = await Address.create({
    userId: userId,
    phone,
    alias,
    details,
    country,
    city,
    street,
    postCode,
  });

  res.status(200).json({
    status: "Success",
    message: "Address added successfully",
    data: addresesData,
  });
});

// @desc  Remove Address from user addresses list
// @route DELETE /api/v1/addresses/:addressId
// @access Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { addressId } = req.params;

  console.log("Params:", req.params);
  if (!userId) {
    return next(new ApiError("User ID is required", 400));
  }

  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }

  const address = await Address.findOne({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    return next(new ApiError("Address not found in this user", 404));
  }

  await Address.destroy({
    where: {
      id: addressId,
      userId,
    },
  });
  const remainingAddresses = await Address.findAll({ where: { userId } });

  res.status(200).json({
    status: "success",
    message: "Address deleted successfully",
    data: remainingAddresses,
  });
});

// @desc  Get logged user address
// @route GET /api/v1/addresses
// @access Protected/User
exports.getLoggedUserAddress = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  if (!id) {
    return next(new ApiError("user Id is required", 400));
  }
  const user = await User.findByPk(id, {
    include: {
      model: Address,
      as: "addresses",
    },
  });
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  if (!user.addresses || user.addresses.length === 0) {
    return next(new ApiError("No addresses found for this user", 404));
  }
  res.status(200).json({
    status: "Success",
    result: user.addresses.length,
    data: user.addresses,
  });
});
