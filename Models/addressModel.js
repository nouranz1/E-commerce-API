const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");

const Address = sequelize.define("Addreses", {
  id: {
    type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
    allowNull: false,
  },
  phone: { type: DataTypes.STRING() },
  alias: {
    type: DataTypes.STRING(),
    allowNull: false,
  },
  details: {
    type: DataTypes.STRING(),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(),
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING(),
    allowNull: false,
  },
  postCode: {
    type: DataTypes.STRING(),
    allowNull: false,
  },
});

module.exports = Address;
