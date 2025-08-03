const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");

const Coupons = sequelize.define(
  "Coupons",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expire: {
      type: DataTypes.DATE(),
      allowNull: false,
    },
    discount: {
      type: DataTypes.FLOAT(),
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = Coupons;
