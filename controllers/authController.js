const User = require('../models/User');
const responseHandler = require('../utils/responseHandler');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (userId) => {
  try {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  } catch (error) {
    throw new Error('Error generating token');
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return responseHandler.error(res, 400, 'Please provide name, email, and password');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler.error(res, 400, 'User already exists with this email');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // Continue even if email fails - OTP is still saved
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove sensitive data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };

    return responseHandler.success(res, 201, 'User registered successfully. OTP sent to email.', {
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with OTP
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return responseHandler.error(res, 400, 'Please provide email and OTP');
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return responseHandler.error(res, 401, 'Invalid credentials');
    }

    // Verify OTP
    const isOTPValid = user.verifyOTP(otp);
    if (!isOTPValid) {
      return responseHandler.error(res, 401, 'Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    user.clearOTP();
    user.isVerified = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove sensitive data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };

    return responseHandler.success(res, 200, 'Login successful', {
      user: userData,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request OTP for login
// @route   POST /api/auth/request-otp
// @access  Public
const requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return responseHandler.error(res, 400, 'Please provide email');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.error(res, 404, 'User not found');
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, otp);
      return responseHandler.success(res, 200, 'OTP sent to your email');
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return responseHandler.error(res, 500, 'Failed to send OTP email. Please try again.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return responseHandler.error(res, 400, 'Please provide email');
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return responseHandler.success(res, 200, 'If user exists, password reset link will be sent to email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      return responseHandler.success(res, 200, 'Password reset link sent to your email');
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Reset token fields on email failure
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return responseHandler.error(res, 500, 'Failed to send password reset email. Please try again.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate input
    if (!password) {
      return responseHandler.error(res, 400, 'Please provide new password');
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return responseHandler.error(res, 400, 'Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    // Generate token
    const jwtToken = generateToken(user._id);

    // Remove sensitive data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };

    return responseHandler.success(res, 200, 'Password reset successful', {
      user: userData,
      token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  requestOTP,
  forgotPassword,
  resetPassword,
};

