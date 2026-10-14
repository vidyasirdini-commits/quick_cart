const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const errorResponse = (res, message, statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details ? { details } : {}),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
