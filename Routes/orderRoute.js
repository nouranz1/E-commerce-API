const express = require("express");

const router = express.Router();
const {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDeliver,
  checkoutSession,
} = require("../Controllers/orderController");
const AuthController = require("../Controllers/authController");

router.use(AuthController.protect);
router.get(
  "/checkout-session/:cartId",
  AuthController.allowedTo("user"),
  checkoutSession
);

router
  .route("/:cartId")
  .post(AuthController.allowedTo("user"), createCashOrder);
router.get(
  "/",
  AuthController.allowedTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  findAllOrders
);
router.get("/:id", findSpecificOrder);
router.put(
  "/:id/pay",
  AuthController.allowedTo("admin", "manager"),
  updateOrderToPaid
);
router.put(
  "/:id/deliver",
  AuthController.allowedTo("admin", "manager"),
  updateOrderToDeliver
);
module.exports = router;
