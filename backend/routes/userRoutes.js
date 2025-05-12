const express = require('express');
const userController = require('../controllers/authController');
const jwtAuth = require('../middleware/jwtauth');
const router = express.Router();

router.post('/initiate-signup',userController.initiateSignup)
router.post('/verify-otp',userController.verifyOtp)

router.post('/resend-email-otp',userController.resendEmailOTP);
router.post('/register',userController.registerUser);
router.post('/googleLogin',userController.googleAuth);
router.post('/signin',userController.signin);
router.post('/logout/:userId',userController.userLogout);
router.get('/getuser',jwtAuth,userController.getuser);



module.exports = router;
