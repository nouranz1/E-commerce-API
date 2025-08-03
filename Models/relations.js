const Product = require("./productModel");
const Category = require("./categoryModel");
const SubCategory = require("./subCategoryModel");
const Brand = require("./brandModel");
const Reviews = require("./reviewModel");
const User = require("./userModel");
const Addreses = require("./addressModel");
const Cart = require("./cartModel");
const CartItems = require("./cartItems");
const Order = require("./orderModel");

// العلاقة بين Category و SubCategory
Category.hasMany(SubCategory, {
  foreignKey: "categoryId",
  as: "subcategories",
  onDelete: "CASCADE",
});
SubCategory.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

Product.belongsTo(SubCategory, {
  foreignKey: "subCategoryId",
  as: "subCategory",
});
SubCategory.hasMany(Product, { foreignKey: "subCategoryId", as: "products" });

Product.belongsTo(Brand, { foreignKey: "brandId", as: "brand" });
Brand.hasMany(Product, { foreignKey: "brandId", as: "products" });

Reviews.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Reviews, { foreignKey: "userId", as: "reviews" });

Product.hasMany(Reviews, { foreignKey: "productId", as: "reviews" });
Reviews.belongsTo(Product, { foreignKey: "productId", as: "product" });

// علاقة بين اليوزر والبرودكت عبر جدول وسيط
User.belongsToMany(Product, {
  through: "wishlist",
  as: "wishlistProducts",
  foreignKey: "userId",
});
Product.belongsToMany(User, {
  through: "wishlist",
  as: "userWishlisted",
  foreignKey: "productId",
});

// Addresses relations
User.hasMany(Addreses, { as: "addresses", foreignKey: "userId" });
Addreses.belongsTo(User, { foreignKey: "userId" });

// Carts relations
User.hasOne(Cart, { foreignKey: "userId" });
Cart.belongsTo(User, { foreignKey: "userId" });

Cart.hasMany(CartItems, { foreignKey: "cartId", as: "cartItems" });
CartItems.belongsTo(Cart, { foreignKey: "cartId" });

Product.hasMany(CartItems, { foreignKey: "productId" });
CartItems.belongsTo(Product, { foreignKey: "productId" });

// User-Order
// Oredr relations
// كل طلب مرتبط بسلة واحدة
Order.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });
Cart.hasOne(Order, { foreignKey: "cartId" });

Order.hasMany(CartItems, { foreignKey: "orderId" });
CartItems.belongsTo(Order, { foreignKey: "orderId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });
