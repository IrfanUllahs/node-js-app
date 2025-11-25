const express = require('express');
const router = express.Router();
const {
  register,
  login,
  requestOTP,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/request-otp', asyncHandler(requestOTP));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password/:token', asyncHandler(resetPassword));

module.exports = router;

