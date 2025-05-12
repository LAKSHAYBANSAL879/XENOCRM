import { 
  Box,   Typography,   Button,   Container,   Paper,   Grid,  createTheme,  ThemeProvider} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f5f5f5',
    },
  },
});

const FeatureCard = ({ icon, title, description }) => {
  
  return (
      <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          color: 'primary.main' 
        }}
      >
        {icon}
        <Typography variant="h5" sx={{ ml: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const handleCampaignsClick = () => {
    navigate('/campaigns');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          bgcolor: 'background.default', 
          minHeight: '100vh',
          color: 'text.primary',
          pb: 8
        }}
      >
       
        <Box 
          sx={{ 
            bgcolor: 'primary.main',
            pt: 4,
            pb: 8,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                mb: 3,
                color: '#ffffff'
              }}
            >
              Mini CRM Platform
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
              }}
            >
              Segment customers, deliver personalized campaigns, and gain intelligent insights
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleCampaignsClick}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Go to Campaigns
              <CampaignIcon sx={{ ml: 1 }} />
            </Button>
          </Container>
        </Box>

        
        <Container maxWidth="lg" sx={{ mt: -6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                icon={<PeopleIcon fontSize="large" />}
                title="Customer Segmentation"
                description="Easily segment your customers based on behavior, demographics, and engagement patterns to target the right audience for each campaign."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                icon={<CampaignIcon fontSize="large" />}
                title="Personalized Campaigns"
                description="Create and deliver highly targeted marketing campaigns that resonate with each customer segment for maximum impact and conversion."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                icon={<InsightsIcon fontSize="large" />}
                title="Intelligent Insights"
                description="Gain actionable insights from campaign performance data to continuously optimize your marketing strategy and ROI."
              />
            </Grid>
          </Grid>
        </Container>

       
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Why Choose Our CRM Platform?
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ✓ All-in-One Solution
                  </Typography>
                  <Typography variant="body1">
                    Manage your customer relationships, marketing campaigns, and analytics in one centralized platform.
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ✓ Data-Driven Decisions
                  </Typography>
                  <Typography variant="body1">
                    Make informed business decisions with comprehensive analytics and performance tracking.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ✓ Easy to Use
                  </Typography>
                  <Typography variant="body1">
                    Intuitive interface designed for marketers of all technical levels with no coding required.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ✓ Scalable & Secure
                  </Typography>
                  <Typography variant="body1">
                    Grows with your business while ensuring your customer data is protected and secure.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                size="large"
                color="primary"
                onClick={handleCampaignsClick}
                sx={{ 
                  px: 4,
                  py: 1.5
                }}
              >
                Explore Campaigns
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;