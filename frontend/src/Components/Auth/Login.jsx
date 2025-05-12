import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../../userContext';
import { toast } from 'react-toastify';
import { useNavigate,Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  Grid,  Box,  Typography,  TextField,  Button,  InputAdornment,  IconButton,} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse?.credential) {
      const decoded = jwtDecode(credentialResponse.credential);
      const {email } = decoded;
      try {
        const response = await axios.post('https://xenocrm-j1t6.onrender.com/api/v1/auth/googleLogin', {
          email,
        });

        const { token, user } = response.data;
        setUser(user);
        Cookies.set('token', token, { expires: 7 });
        toast.success('Google Login successful');
        navigate('/');
      } catch (error) {
        console.error("Google login failed:", error);
        toast.error('Google login failed, try again');
      }
    } else {
      alert("Login failed. Try again!");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login failed. Please try again.");
  };

  const loginUser = async (ev) => {
    ev.preventDefault();
    try {
      const response = await axios.post('https://xenocrm-j1t6.onrender.com/api/v1/auth/signin', {
        email,
        password,
      });
      toast.success('User Login successful');
      setUser(response.data.user);
      const token = response.data.token;
      Cookies.set('token', token, { expires: 7 });
      navigate('/');
    } catch (error) {
      toast.error('Error logging in. Please check your credentials.',{error});
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" minHeight="100vh">
      <Grid item xs={11} sm={8} md={5} lg={4}>
        <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Sign in to your account
            </Typography>
          </Box>

          <form onSubmit={loginUser}>
            <TextField
              margin="normal"
              fullWidth
              required
              id="email"
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              margin="normal"
              fullWidth
              required
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Link href="/forgot" underline="hover" variant="body2" color="primary">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </form>

          <Typography align="center" sx={{ my: 2 }}>
            OR
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              width={'1200px'}
            />
          </Box>

          <Typography align="center" variant="body2">
            Not a member?{' '}
            <Link to="/signup" underline="hover" color="primary">
              Signup
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

