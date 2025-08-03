const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

const Cart = require("../Models/cartModel");
const cartItems = require("../Models/cartItems");
const Order = require("../Models/orderModel");
const Product = require("../Models/productModel");
const User = require("../Models/userModel");
const CartItems = require("../Models/cartItems");

// @desc  Create cash order
// @route POST /api/v1/orders/cartId
// @access Private/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // App setting
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart depends on cartId
  const cart = await Cart.findByPk(req.params.cartId, {
    include: [{ model: cartItems, as: "cartItems" }],
  });
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this id: ${req.params.cartId}`, 404)
    );
  }
  // 2- Get order price depend on cart price (check if there is a coupon applied)
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- Create order with default paymentMethodType cash
  const order = await Order.create({
    userId: req.user.id,
    cartId: cart.id,
    totalOrderPrice,
    shippingAddress: req.body.shippingAddress,
  });

  // 4- After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkUpdates = cart.cartItems.map(async (item) => {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        product.sold += item.quantity;
        await product.save();
      }
    });

    await Promise.all(bulkUpdates);
  }
  await cartItems.update({ orderId: order.id }, { where: { cartId: cart.id } });
  // 5- clear cart depends on cartId
  await Cart.destroy({ where: { id: req.params.cartId } });

  res.status(200).json({ status: "Success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { userId: req.user.id };
  }
  next();
});

// @desc Get all orders
// @route GET /api/v1/orders
// @access Protected/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order, [
  {
    model: User,
    as: "user",
    attributes: ["name", "profileImg", "email", "phone"],
  },
  {
    model: Cart,
    as: "cart",
    include: [
      {
        model: CartItems,
        as: "cartItems",
        include: [
          {
            model: Product,
            attributes: ["title", "imageCover"],
          },
        ],
      },
    ],
  },
]);

// @desc Get specific order by id
// @route GET api/v1/orders/:id
// @access Protected/User-Admin-Manager
exports.findSpecificOrder = factory.getOne(Order, [
  {
    model: User,
    as: "user",
    attributes: ["name", "profileImg", "email", "phone"],
  },
  {
    model: Cart,
    as: "cart",
    include: [
      {
        model: CartItems,
        as: "cartItems",
        include: [
          {
            model: Product,
            attributes: ["title", "imageCover"],
          },
        ],
      },
    ],
  },
]);

// @desc Update specific order payment status
// @route PUT /api/v1/orders/:id/pay
// @access Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }
  // Update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "Success", data: updatedOrder });
});

// @desc Update specific order deliver status
// @route GET, POST /api/v1/orders/:id/deliver
// @access Protected/Admin-Manager
exports.updateOrderToDeliver = asyncHandler(async (req, res, next) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }
  // Update order to delivered
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "Success", data: updatedOrder });
});

// @desc Get checout session from stripe and send it as response
// @route PUT /api/v1/orders/checout-session/cartId
// @access Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // App settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1- Get cart depends on cartId
  const cart = await Cart.findByPk(req.params.cartId, {
    include: { model: CartItems, as: "cartItems" },
  });
  if (!cart) {
    return next(
      new ApiError(
        `There is no such cart with this id: ${req.params.cartId}`,
        404
      )
    );
  }

  // 2- Get order price depend on cart price (check if there is a coupon applied)
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3- create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: cart.cartItems.map((item) => ({
      // Provide the exact Price ID (for example, price_1234) of the product you want to sell
      price_data: {
        currency: "egp",
        product_data: {
          name: req.user.name,
        },
        unit_amount: totalOrderPrice * 100,
      },
      quantity: 1,
    })),
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress, //to send any data with the session
  });
  // 4- Send session with response
  res.status(200).json({ status: "Success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findByPk(cartId, {
    include: [{ model: cartItems, as: "cartitems" }],
  });
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    userId: user.id,
    cartId: cart.id,
    totalOrderPrice: orderPrice,
    shippingAddress,
    isPaid: true,
    paidAt: Date.now(),
    PaymentMethodType: "card",
  });

  // 4- After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkUpdates = cart.cartItems.map(async (item) => {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.quantity -= item.quantity;
        product.sold += item.quantity;
        await product.save();
      }
    });

    await Promise.all(bulkUpdates);
  }
  await cartItems.update({ orderId: order.id }, { where: { cartId: cart.id } });
  // 5- clear cart depends on cartId
  await Cart.destroy({ where: { id: cartId } });
};

// @desc  This webhook will run when stripe payment success paid
// @route POST /webhook-checkout
// @access Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    // Create Order
    createCardOrder(event.data.object);
  }
  res.status(200).json({ received: true });
  // 4242424242424242 Fake card number
});
