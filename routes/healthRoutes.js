const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const responseHandler = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
const healthCheck = asyncHandler(async (req, res) => {
  try {
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    };

    if (mongoose.connection.readyState === 1) {
      return responseHandler.success(res, 200, 'Application is running', healthStatus);
    } else {
      return responseHandler.error(res, 503, 'Application is running but database is disconnected', healthStatus);
    }
  } catch (error) {
    return responseHandler.error(res, 500, 'Health check failed', error.message);
  }
});

router.get('/', healthCheck);

module.exports = router;

