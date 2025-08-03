const { DataTypes } = require("sequelize");
const { sequelize } = require("../Config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.BIGINT({ unsigned: true }),
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      lowercase: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    profileImg: {
      type: DataTypes.STRING(),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("profileImg");
        const baseUrl = process.env.BASW_URL || "http://localhost:8000";
        if (rawValue) {
          return `${baseUrl}/users/${rawValue}`;
        }
        return rawValue;
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
    },
    passwordResetCode: {
      type: DataTypes.STRING,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
    },
    passwordResetVerified: {
      type: DataTypes.BOOLEAN,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "manager"),
      defaultValue: "user",
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        // user.slug = slugify(user.name, { lower: true });
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  },
  { timestamps: true }
);

// User.beforeCreate(async (user) => {
//   if (user.password) {
//     user.password = await bcrypt.hash(user.password, 12);
//   }
// });

// User.beforeUpdate(async (user) => {
//   if (user.changed("password")) {
//     user.password = await bcrypt.hash(user.password, 12);
//   }
// });

module.exports = User;
