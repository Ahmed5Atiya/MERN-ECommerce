const globalError = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (process.env.NODE_ENV == "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

const sendErrorProd = (error, res) => {
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
const sendErrorDev = (error, res) => {
  return res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};
module.exports = globalError;
