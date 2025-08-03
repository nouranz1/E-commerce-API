const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const User = require("../Models/userModel");
const Product = require("../Models/productModel");

// @desc  Add product to wishlist
// @route POST /api/v1/wishlist
// @access Protected/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return next(new ApiError("Product Id is required", 400));
  }

  const user = await User.findByPk(userId);
  const product = await Product.findByPk(productId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  // التحقق إن المنتج مش موجود مسبقًا في المفضلة
  const existingWishlist = await user.getWishlistProducts({
    where: { id: productId },
  });
  if (existingWishlist.length > 0) {
    return next(new ApiError("This product already in your wishlist", 400));
  }
  await user.addWishlistProduct(productId); // alias من العلاقة
  const wishlistProducts = await user.getWishlistProducts();

  res.status(200).json({
    status: "Success",
    message: "Product added successfully to your wishlist",
    data: wishlistProducts,
  });
});

// @desc  Remove product to wishlist
// @route DELETE /api/v1/wishlist/:id
// @access Protected/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  if (!productId) {
    return new next(new ApiError("Product ID is required", 400));
  }
  const user = await User.findByPk(userId);
  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  // التحقق إن المنتج موجود مسبقًا في المفضلة
  const existingWishlist = await user.getWishlistProducts({
    where: { id: productId },
  });
  if (existingWishlist.length == 0) {
    return next(new ApiError("This product not in your wishlist", 400));
  }

  //   الحذف
  await user.removeWishlistProduct(productId);

  const wishlistProducts = await user.getWishlistProducts();

  res.status(200).json({
    status: "Success",
    message: "Product removed successfully from your wishlist",
    data: wishlistProducts,
  });
});

// @desc  Get logged user wishlist
// @route GET /api/v1/wishlist
// @access Protected/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findByPk(id, {
    include: {
      model: Product,
      as: "wishlistProducts",
      attributes: ["id", "title"],
      through: { attributes: [] }, //تجاهل باقي بيانات جدول الوسيط
    },
  });

  if (!user) {
    return next(new ApiError("User not found", 404));
  }
  res
    .status(200)
    .json({
      status: "success",
      results: user.wishlistProducts.length,
      data: user.wishlistProducts,
    });
});
