const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String
  },
  mobileNumber: {
    type: String
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailOTP: String,
  emailOTPExpiry: Date,

  forgotPasswordToken: String,
  forgotPasswordExpiryDate: Date,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods = {
  jwtToken() {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        role: this.role
      },
      process.env.SECRET,
      { expiresIn: '96h' }
    );
  },

  getEmailOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    this.emailOTP = crypto.createHash('sha256').update(otp).digest('hex');
    this.emailOTPExpiry = Date.now() + 10 * 60 * 1000; 
    return otp;
  },

  verifyEmailOTP(otp) {
    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    return (
      this.emailOTP === hashed &&
      this.emailOTPExpiry > Date.now()
    );
  },

  getForgotPasswordToken() {
    const forgotToken = crypto.randomBytes(20).toString('hex');
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex');
    this.forgotPasswordExpiryDate = Date.now() + 120 * 60 * 1000;
    return forgotToken;
  }
};

userSchema.statics.ensureAdminExists = async function () {
  const adminCount = await this.countDocuments({ role: 'admin' });
  if (adminCount === 0) {
    await this.create({
      name: 'Lakshay Bansal',
      email: 'lakshaybansal879@gmail.com',
      password: 'lb879',
      role: 'admin',
      emailVerified: true
    });
  }
};

module.exports = mongoose.model('User', userSchema);
