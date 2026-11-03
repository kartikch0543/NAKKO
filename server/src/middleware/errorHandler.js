/**
 * NAKKO Backend - Standardized Error Handling Middleware
 */

export function errorHandler(err, req, res, next) {
  console.error(`[Server Error] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}
