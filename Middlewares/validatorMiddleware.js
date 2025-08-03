const { validationResult } = require("express-validator");

const validatorMiddleware = (req, res, next) => {
  // **2- middleware => catch errors from rules if exist
  // Find the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
  // If there are no validation errors, proceed to the next middleware
};

module.exports = validatorMiddleware;
