const responseHandler = {
  success: (res, statusCode, message, data = null) => {
    const response = {
      success: true,
      message: message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  },

  error: (res, statusCode, message, error = null) => {
    const response = {
      success: false,
      message: message,
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error;
    }

    return res.status(statusCode).json(response);
  },
};

module.exports = responseHandler;

