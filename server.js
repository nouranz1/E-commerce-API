const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
// const csrf = require("csurf");
// const cookieParser = require("cookie-parser");
const hpp = require("hpp");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./Middlewares/errorMiddleware");
const { dbConnection } = require("./Config/database");
const mountRoutes = require("./Routes/index");
const { webhookCheckout } = require("./Controllers/orderController");

//  nodemon بتعمل ريستارت للسيرفر تلقائي

require("./Models/relations");

// Call database connection
dbConnection();

// express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options(/(.*)/, cors());

// Compress all responses
app.use(compression());

// // Enable csrf protection on all requests
// app.use(cookieParser());
// app.use(csrf({ cookie: true }));

// app.get("/form", (req, res) => {
//   res.render("form", { csrfToken: req.csrfToken() });
// });

// checkout webhook
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.get("/", (req, res) => {
  res.send("Server is working!");
});

// Limit each IP to 100 requests per `window` (here, per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

app.use("/api/", limiter);

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "ratingAverage",
      "ratingQuantity",
      "quantity",
      "filter",
    ],
  })
);

// Mount Routes
mountRoutes(app);

//
app.all(/(.*)/, (err, req, res, next) => {
  // send errors to error handling middelware
  next(new ApiError(`Cant find this route : ${req.originalUrl}`, 404));
  next(err.message);
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle Rejections Outside Express
// Event => listen => callbaks(err)
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting down server due to unhandled rejection");
    process.exit(1);
  });
});
