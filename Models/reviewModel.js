const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");

const Reviews = sequelize.define(
  "Reviews",
  {
    title: {
      type: DataTypes.STRING,
    },
    ratings: {
      type: DataTypes.FLOAT,
      validate: {
        len: {
          args: [1, 5],
          msg: "Rating must be between 1.0 and 5.0",
        },
      },
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = Reviews;
