const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// CRUD operations

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: "Name is already existed, Use another one!",
      },
      // validate: {
      //     notNull: {
      //         msg: 'category name is required'
      //     },
      //     len: {
      //         args: [3, 32],
      //         msg: "Category name must be between 3 and 32 character"
      //     },
      // }
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
          return `${baseUrl}/categories/${rawValue}`;
        }
        return rawValue;
      },
    },
  },
  { timestamps: true } //لتفعيل الحقول createdAt و updatedAt تلقائيًا
);

module.exports = Category;
