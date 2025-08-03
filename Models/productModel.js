const { sequelize } = require("../Config/database");
const { DataTypes } = require("sequelize");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.BIGINT({ unsigned: true, zerofill: false }),
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "Price must be greater than 0",
        },
        max: {
          args: [999999],
          msg: "Price is too high",
        },
      },
    },
    priceAfterDiscount: {
      type: DataTypes.FLOAT,
    },
    colors: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    imageCover: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue("imageCover");
        const baseUrl = process.env.BASE_URL || "http://localhost:8000";
        if (rawValue) {
          return `${baseUrl}/products/${rawValue}`;
        }
        return rawValue;
      },
    },
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
      get() {
        const rawValue = this.getDataValue("images");
        const baseUrl = process.env.BASE_URL || "http://localhost:8000";
        if (rawValue) {
          return `${baseUrl}/products/${rawValue}`;
        }
        return rawValue;
      },
    },
    ratingAverage: {
      type: DataTypes.FLOAT,
      validate: {
        min: {
          args: [1],
          msg: "Rating must be greater than or equal to 1",
        },
        max: {
          args: [5],
          msg: "Rating must be less than or equal to 5",
        },
      },
    },
    ratingQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Product.associate = (models) => {
//   Product.hasMany(models.Reviews, {
//     foreignKey: "productId",
//     as: "reviews",
//   });
// };

module.exports = Product;
