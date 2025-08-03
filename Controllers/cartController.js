const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Cart = require("../Models/cartModel");
const CartItems = require("../Models/cartItems");
const Product = require("../Models/productModel");
const Coupon = require("../Models/couponModel");
const { Op } = require("sequelize");

const calcTotalCartPrice = async (cartId) => {
  const cartItems = await CartItems.findAll({ where: { cartId } });
  if (!cartItems || cartItems.length === 0) return 0;

  let totalPrice = 0;
  cartItems.forEach((cartItem) => {
    totalPrice += cartItem.quantity * cartItem.price;
  });

  return totalPrice;
};

// @desc  Add product to shopping cart
// @route POST /api/v1/carts
// @access Private/User
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  // 1- Get Cart for logged user
  const { productId, color } = req.body;
  if (!productId || !color) {
    return next(new ApiError("Product ID and color are required", 400));
  }
  const userId = req.user.id;
  let cart = await Cart.findOne({
    where: { userId },
  });
  if (!cart) {
    // Create cart for the logged user with product
    cart = await Cart.create({ userId });
  }
  //   بعد التأكد من وجود السلة، نحتاج إلى:
  // التأكد أن رقم المنتج موجود فعلًا.
  // البحث إذا كان هذا المنتج موجود في CartItems لنفس السلة.
  // إذا موجود: زيادة الكمية.
  // إذا غير موجود: إضافته جديد.
  // 1)

  // 2- التأكد أن المنتج موجود
  const product = await Product.findByPk(productId);
  if (!product) {
    return next(new ApiError("Product not found", 404));
  }
  // 3- هل المنتج موجود بالفعل في cartItems؟
  let cartItem = await CartItems.findOne({
    where: {
      cartId: cart.id,
      productId,
      color,
      price: product.price,
    },
  });

  if (cartItem) {
    // 4- إذا موجود: نزيد الكمية
    cartItem.quantity += 1;
    await cartItem.save();
  } else {
    // 5- إذا غير موجود: نضيفه جديد
    // لو مش موجود، بننشئه.
    cartItem = await CartItems.create({
      cartId: cart.id,
      productId,
      color,
      quantity: 1,
      price: product.price || 0,
    });
  }

  // ✅ بنعيد حساب السعر الكلي بناءً على العناصر الفعلية الموجودة في CartItems.
  const totalCartPrice = await calcTotalCartPrice(cart.id);
  cart.totalCartPrice = totalCartPrice;
  await cart.save();

  const updatedCartItems = await CartItems.findAll({
    where: { cartId: cart.id },
  });
  res.status(200).json({
    status: "Success",
    message: "Product added to cart successfully",
    data: { cartItem, cartItems: updatedCartItems, totalCartPrice },
  });
});

// @desc  Get Logged user cart
// @route GET /api/v1/carts
// @access Private/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({
    where: { userId },
    include: [{ model: CartItems, as: "cartItems" }],
  });
  if (!cart) {
    return next(
      new ApiError(`There is no Cart belong to this user id: ${userId}`, 404)
    );
  }
  res.status(200).json({
    status: "Success",
    cartItemsNo: cart.cartItems.length,
    data: cart,
  });
});

// @desc  Remove product from shopping cart
// @route DELETE /api/v1/carts/:id
// @access Private/User
exports.removeItemFromCart = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const cartItem = await CartItems.findByPk(itemId);
  if (!cartItem) {
    return next(new ApiError(`There is no item for this Id: ${itemId}`, 404));
  }

  const cartId = cartItem.cartId;

  await cartItem.destroy();

  const totalCartPrice = await calcTotalCartPrice(cartId);

  const cart = await Cart.findByPk(cartId);
  if (cart) {
    cart.totalCartPrice = totalCartPrice;
    await cart.save();
  }

  const remainingItems = await CartItems.count({ where: { cartId } });

  res.status(200).json({
    status: "Success",
    message: "Cart Item deleted Successfully",
    data: { cartId, totalCartPrice, cartItemsNo: remainingItems },
  });
});

// @desc  clear user cart
// @route DELETE /api/v1/carts
// @access Private/User
exports.clearUserCart = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ where: { userId } });
  if (!cart) {
    return next(
      new ApiError(`There is no Cart for this user id: ${userId}`, 404)
    );
  }
  await cart.destroy();

  res
    .status(200)
    .json({ status: "Success", message: "Cart cleared successfully" });
});

// @desc  Update Item quantity
// @route PUT /api/v1/carts/:id
// @access Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const userId = req.user.id;
  const { itemId } = req.params;

  // 1. احضار السلة الخاصة بالمستخدم
  const cart = await Cart.findOne({
    where: { userId },
    include: [{ model: CartItems, as: "cartItems" }],
  });
  if (!cart) {
    return next(new ApiError(`There is no cart for this user: ${userId}`, 404));
  }

  // 2. التحقق من وجود العنصر داخل السلة
  // + بتحول السترينغ لرقم,
  const cartItem = cart.cartItems.find((item) => item.id === +itemId);
  if (!cartItem) {
    return next(new ApiError(`There is no item for this ID: ${itemId}`, 404));
  }

  // 3. تعديل الكمية وحفظها
  cartItem.quantity = quantity;
  if (quantity < 1) {
    return next(new ApiError("Quantity must be at least 1", 400));
  }
  await cartItem.save();
  // 4. إعادة حساب السعر الإجمالي
  const totalPrice = await calcTotalCartPrice(cart.id);
  // 5. تحديث السلة بالسعر الجديد
  cart.totalCartPrice = totalPrice;
  await cart.save();
  const updatedCart = await Cart.findByPk(cart.id, {
    include: [{ model: CartItems, as: "cartItems" }],
  });

  res.status(200).json({
    status: "success",
    numOfCartItems: updatedCart.cartItems.length,
    data: updatedCart,
    totalCartPrice: totalPrice,
  });
});

// @desc  Apply Coupons on shopping cart
// @route PUT /api/v1/carts
// @access Private/User
exports.applyCopouns = asyncHandler(async (req, res, next) => {
  // 1- Get coupon based on coupon name, then check if its expired or invalid
  const coupon = await Coupon.findOne({
    where: {
      name: req.body.coupon,
      expire: { [Op.gt]: new Date() },
    },
  });
  if (!coupon) {
    return next(new ApiError(`Coupon is expired or invalid`, 400));
  }
  // 2- Get User cart to get the total price
  const userId = req.user.id;
  const cart = await Cart.findOne({
    where: { userId },
    include: ["cartItems"],
  });
  if (!cart) {
    return next(new ApiError("Cart not found for the user", 404));
  }
  const totalPrice = cart.totalCartPrice;

  // 3- Calculate price after applying coupon discount
  const totalPriceAfterDiscount = parseFloat(
    totalPrice - (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  // 4) Update cart with new price after discount
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: {
      cart,
      // totalCartPrice: totalPrice,
      // totalPriceAfterDiscount,
    },
  });
});
