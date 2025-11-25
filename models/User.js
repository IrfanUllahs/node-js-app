const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpire: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpire: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

// Method to generate and save OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expireTime = new Date();
  expireTime.setMinutes(expireTime.getMinutes() + parseInt(process.env.OTP_EXPIRE_MINUTES || 10));

  this.otp = otp;
  this.otpExpire = expireTime;

  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  try {
    if (!this.otp || !this.otpExpire) {
      return false;
    }

    if (new Date() > this.otpExpire) {
      return false; // OTP expired
    }

    return this.otp === enteredOTP;
  } catch (error) {
    return false;
  }
};

// Method to clear OTP
userSchema.methods.clearOTP = function () {
  this.otp = null;
  this.otpExpire = null;
};

module.exports = mongoose.model('User', userSchema);

