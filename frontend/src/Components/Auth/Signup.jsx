import React, { useState } from 'react';
import {Box,  Button,  Container,  TextField,  Typography,  Stepper,  Step,  StepLabel,  Paper,  Grid,  InputAdornment,  IconButton,  FormControl,  InputLabel,  Select,  MenuItem,  CircularProgress,  Snackbar,  Alert} from '@mui/material';
import { Visibility, VisibilityOff, Email, Person, Phone, Lock } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = 'https://xenocrm-j1t6.onrender.com/api/v1';

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Enter Email', 'Verify OTP', 'Complete Registration'];

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate=useNavigate();
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }
    if(!isValidEmail(email)){
        toast.error("Please enter valid email address");
        return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/initiate-signup`, { email });
      setUserId(response.data.userId);
      toast.success('OTP sent to your email');
      setActiveStep(1);
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
        
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };


  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('OTP is required');
      return;
    }
    try {
        const userData = {
            userId,
            otp
          };
          const response = await axios.post(`${API_URL}/auth/verify-otp`, userData);
         toast.success('Registration successful! Redirecting to Next Step')
          console.log(response)

          setActiveStep(2);       

    } catch (err) {
        toast.error(err.response?.data?.message || 'Incorrect OTP entered');
  };
}

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/resend-email-otp`, { email });
      toast.success('OTP resent to your email');
      
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

 
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    

    if (!name || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const userData = {
        userId,
        name,
        password,
        mobileNumber
      };
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      toast.success('Registration successful! Redirecting to login...');
      console.log(response)
      
      setTimeout(() => {
       ;
      }, 2000);
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
     
    } finally {
      setLoading(false);
    }
  };
 
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email "
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}

            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleOtpVerify} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                disabled={countdown > 0 || loading}
                onClick={handleResendOtp}
                variant="text"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handleFinalSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="mobileNumber"
                  label="Mobile Number (Optional)"
                  name="mobileNumber"
                  autoComplete="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
              </Grid>
              <Grid item xs={16}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
             
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create an Account
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {getStepContent(activeStep)}
        
        <Box sx={{ mt: 3, width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={() => setActiveStep((prevStep) => prevStep - 1)}
          >
            Back
          </Button>
        </Box>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Button color="primary" href="/login">
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>
      
      
    </Container>
  );
};

export default Signup;