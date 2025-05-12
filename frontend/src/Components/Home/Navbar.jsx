import React, { useContext, useState } from 'react';
import { 
  AppBar,  Toolbar,   Typography,  Button,  Avatar,   Menu,   MenuItem,  IconButton,  Box} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../userContext';
import axios from 'axios';
import Cookies from 'js-cookie';

const Navbar = () => {
  const navigate = useNavigate();
  const {user,setUser}=useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout =async () => {
    try {
        const userId=user._id
        await axios.post(`http://localhost:8080/api/v1/auth/logout/${userId}`);
    
        setUser(null);
        Cookies.remove("token");
        handleMenuClose();
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    
  };
  
  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className='sticky z-10  w-full -mt-4 py-5' style={{backgroundColor:'#1976d2'}}>
     
      <Toolbar sx={{flex:'row',justifyContent:'space-between'}}>
         <Link to='/'>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            letterSpacing: '1px',
            fontSize: '1.9rem',
            color:'white'
          }}
        >
          CRM
        </Typography>
 </Link>
       
        {user ? (
          <>
            <IconButton 
              onClick={handleMenuClick}
              size="small"
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar 
                sx={{ 
                  width: 55, 
                  height: 55, 
                  bgcolor: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.8rem',
                  color:'black'
                  
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button             
            variant="outlined" 
            onClick={handleLogin}
            sx={{ 
              borderColor: 'white',
               color:"white",
            fontSize:'1.3rem',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                color:"white",
                fontSize:'1.4rem'
              }
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </div>
  );
};

export default Navbar;