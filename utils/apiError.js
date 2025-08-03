// @description: Custom error class for handling API errors
// this class is responsible about operation errors (errors that i can predict)
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  }
}

module.exports = ApiError;
// //  لو بدك ترجعها للكنترولر
