const { sequelize } = require("../Config/database");
const { DataTypes } = require("sequelize");
// const Category = require("./categoryModel");

const SubCategory = sequelize.define(
  "subCategory",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Name is already existed, Use another one!",
      },
      // validate: {
      //   len: {
      //     args: [2, 32],
      //     msg: "Subcategory name must be between 2 and 32 characters long",
      //   },
      // },
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeValidate: (subCat) => {
        if (subCat.name && typeof subCat.name === "string") {
          subCat.name = subCat.name.trim();
          subCat.slug = subCat.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }
      },
    },
  }
);

module.exports = SubCategory;
