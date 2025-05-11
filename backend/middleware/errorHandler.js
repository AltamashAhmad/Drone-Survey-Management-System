// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Database errors
  if (err.code === '23505') { // unique violation
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
      detail: err.detail
    });
  }

  if (err.code === '23503') { // foreign key violation
    return res.status(400).json({
      status: 'error',
      message: 'Invalid reference to related resource',
      detail: err.detail
    });
  }

  // JWT authentication errors
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or no token provided'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors
    });
  }

  // Default error
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler; 