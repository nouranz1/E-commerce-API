const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");

// CRUD operations

const Brand = sequelize.define(
  "Brand",
  {
    id: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // unique: {
      //   msg: "Name is already existed, Use another one!",
      // },
    },
    slug: {
      // A and B => shoping.com/a-and-b
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue("image");
        const baseUrl = process.env.BASE_URL || "http://localhost:8000";
        if (rawValue) {
          return `${baseUrl}/brands/${rawValue}`;
        }
        return rawValue;
      },
    },
  },
  { timestamps: true } //لتفعيل الحقول createdAt و updatedAt تلقائيًا
);

module.exports = Brand;
