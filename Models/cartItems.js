const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");

const CartItems = sequelize.define(
  "cartItems",
  {
    id: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      allowNull: false,
    },
    cartId: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER(),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
    },
  },
  { timestamps: true }
);
module.exports = CartItems;
