const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "../config.env") });

const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: "mysql",
  logging: false,
});

const dbConnection = async () => {
  await sequelize.authenticate();
  console.log("Database connected succesfully");
};

sequelize
  .sync
  // (  {force: true})
  // { alter: true }
  ()
  .then(() => {
    console.log("All models synchronized successfully");
  })
  .catch((err) => {
    console.log("Error synchronizing models:", err);
  });
module.exports = { sequelize, dbConnection };
