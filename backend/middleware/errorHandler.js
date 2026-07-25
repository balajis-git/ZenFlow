const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  console.error(`[Error Handler] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue).join(', ');
    const message = `Duplicate value entered for field(s): ${fields}`;
    error = { status: 400, message };
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { status: 400, message };
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    error = { status: 401, message: 'Invalid token, authorization denied' };
  }
  if (err.name === 'TokenExpiredError') {
    error = { status: 401, message: 'Session expired, please login again' };
  }

  const statusCode = error.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
