const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      autoIncrement: true,
      primaryKey: true,
    },
    // userId: {
    //   type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
    //   allowNull: false,
    // },
    // cartId: {
    //   type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
    //   allowNull: false,
    // },
    taxPrice: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
    },
    shippingPrice: {
      type: DataTypes.DECIMAL(10, 3),
      defaultValue: 0,
    },
    totalOrderPrice: {
      type: DataTypes.DECIMAL(10, 3),
    },
    paymentMethodType: {
      type: DataTypes.ENUM("card", "cash"),
      defaultValue: "cash",
    },
    isPaid: {
      type: DataTypes.BOOLEAN(),
    },
    paidAt: {
      type: DataTypes.DATE(),
    },
    isDelivered: {
      type: DataTypes.BOOLEAN(),
    },
    deliveredAt: {
      type: DataTypes.DATE(),
    },
  },
  { timestamps: true }
);

module.exports = Order;
