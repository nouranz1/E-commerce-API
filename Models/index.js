// models/index.js
const { sequelize } = require("../Config/database");
const Product = require("./productModel");
const Category = require("./categoryModel");
const SubCategory = require("./subCategoryModel");
const Brand = require("./brandModel");
const User = require("./userModel");
const Reviews = require("./reviewModel");
const Cart = require("./cartModel");
const CartItems = require("./cartItems");
const Address = require("./addressModel");
const Order = require("./orderModel");

// استدعاء العلاقات وتعريفها
require("./relations");

module.exports = {
  sequelize,
  Product,
  Category,
  SubCategory,
  Brand,
  User,
  Reviews,
  Address,
  Cart,
  CartItems,
  Order,
};
