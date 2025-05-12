const User = require('../modals/user'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// User initiates signup with email
exports.initiateSignup = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required.' 
      });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email, emailVerified: true });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered.' 
      });
    }
    
    // Find or create unverified user
    let user = await User.findOne({ email, emailVerified: false });
    if (!user) {
      user = new User({ email });
    }
    
    // Generate OTP for email verification
    const otp = user.getEmailOTP();
    await user.save();
    
    // Send OTP via email
    const mailOptions = {
      from: 'lbansal879880@gmail.com',
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is ${otp}. This OTP is valid for 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({
          success: false,
          message: 'Error sending OTP email'
        });
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(200).json({ 
      success: true, 
      message: 'OTP sent to your email.',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// Step 2: Verify OTP
exports.verifyOtp = async (req, res) => {
    try {
      const { userId, otp } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const isValid = user.verifyEmailOTP(otp);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
  
      // Mark as verified (but don’t complete signup yet)
      user.emailVerified = true;
      user.emailOTP = undefined;
      user.emailOTPExpiry = undefined;
      await user.save();
  
      res.status(200).json({ success: true, message: 'OTP verified. You can now complete registration.' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
//  User verifies OTP and completes registration
exports.registerUser = async (req, res) => {
  try {
    const { 
      userId,
      otp,
      name, 
      password,
      mobileNumber,
      role 
    } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    // Verify OTP
    if (!user.emailVerified) {
        return res.status(400).json({ success: false, message: 'Email not verified.' });
      }
    
    // Check admin limit
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'An admin already exists. Cannot register a new admin.' 
        });
      }
    }
    
    // Update user details
    user.name = name;
    user.password = password;
    user.mobileNumber = mobileNumber;
    user.role = role || 'employee';
    
    await user.save();
    
    // Generate token
    const token = user.jwtToken();

    res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// User signin with email and password
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified. Please complete registration first.',
      });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id,name: user.name  }, process.env.SECRET, {
      expiresIn: "1d",
    });
    
    return res.status(200).json({
      success: true,
      message: 'User signed in successfully',
      token,
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Google signup/login
exports.googleAuth = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find user by email
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, update details if needed
      if (!user.name && name) {
        user.name = name;
        await user.save();
      }
      
      // Ensure email is marked as verified for Google logins
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        name: name || email.split('@')[0],
        emailVerified: true,
        role: 'employee'
      });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id,name: user.name }, process.env.SECRET, {
      expiresIn: "1d",
    });
    
    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout User
exports.userLogout = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
    };
    
    res.cookie("token", null, cookieOptions);
    
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single User
exports.getuser = async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      return res.status(200).send({
        success: true,
        message: "User Fetched Successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "unable to get current user",
        error,
      });
    }
};
// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -emailOTP -emailOTPExpiry -forgotPasswordToken -forgotPasswordExpiryDate');
    
    res.status(200).json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user 
exports.updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, mobileNumber } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    
   
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email, emailVerified: true });

    // Return error if user not found
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP and set expiry
    user.forgotPasswordToken = crypto.createHash("sha256").update(otp).digest("hex");
    user.forgotPasswordExpiryDate = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: 'lbansal879880@gmail.com',
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. This OTP is valid for 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({
          success: false,
          message: 'Error sending OTP email'
        });
      }
      console.log('Email sent: ' + info.response);
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset Password with OTP
exports.resetPassword = async (req, res) => {
  const { otp, password, email } = req.body;

  // Return error if required fields are missing
  if (!otp || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "OTP, new password, and email are required"
    });
  }

  const hashToken = crypto.createHash("sha256").update(otp).digest("hex");

  try {
    // Find user by email and hashed OTP, check expiry
    const user = await User.findOne({
      email,
      forgotPasswordToken: hashToken,
      forgotPasswordExpiryDate: { $gt: new Date() }
    });

    // Return error if user not found or OTP expired
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or OTP has expired"
      });
    }

    // Update password and clear OTP fields
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiryDate = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Resend OTP for email verification
exports.resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email, emailVerified: false });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already verified"
      });
    }
    
    // Generate new OTP
    const otp = user.getEmailOTP();
    await user.save();
    
    // Send OTP via email
    const mailOptions = {
      from: 'lbansal879880@gmail.com',
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is ${otp}. This OTP is valid for 10 minutes.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).json({
          success: false,
          message: 'Error sending OTP email'
        });
      }
      console.log('Email sent: ' + info.response);
    });
    
    return res.status(200).json({
      success: true,
      message: "OTP resent to your email",
      userId: user._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};