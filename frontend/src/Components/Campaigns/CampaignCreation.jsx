import { useState } from 'react';
import {  Box,  Typography,  Stepper,  Step,StepLabel,  Button,TextField,  MenuItem,Grid,Paper,  Card,  CardContent,  CardHeader,  Chip,  Avatar,  FormControl,  FormHelperText,  InputLabel,  Select,  Alert,  CircularProgress,  Snackbar
} from '@mui/material';
import axios from 'axios'; 
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom'

const CampaignCreation = () => {
  const steps = ['Campaign Details', 'Segmentation', 'Review'];
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    description: '',
    startDate: '',
    budget: '',
    goal: 'awareness',
    customRule: '',
    matchedCustomers: []
  });

  const requiredFields = {
    0: ['name', 'type', 'description', 'startDate', 'budget', 'goal'],
    1: ['customRule']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    let isValid = true;
    
    if (requiredFields[step]) {
      requiredFields[step].forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
          stepErrors[field] = 'This field is required';
          isValid = false;
        }
      });
    }
    
    setErrors(stepErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) {
      return;
    }
  
    if (activeStep === 1 && formData.matchedCustomers.length === 0) {
     toast.error('Invalid customers')
      return;
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const parseCustomerRule = async () => {
    if (!formData.customRule.trim()) {
      setErrors({...errors, customRule: 'This field is required'});
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('https://xenocrm-j1t6.onrender.com/api/v1/customer/parse-rule', { 
        rule: formData.customRule 
      });
      
      setFormData({
        ...formData,
        matchedCustomers: response.data.matchedCustomers,
        condition: response.data.condition
      });
      toast.success(`Rule parsed successfully! Found ${response.data.matchedCustomers.length} matches.`);
    } catch (err) {
      console.error('Error parsing rule:', err);
      toast.error(err.response?.data?.message || 'Failed to parse rule or fetch filtered customers.');
      
    } finally {
      setLoading(false);
    }
  };

  const CampaignCard = ({ title, value }) => (
    <Box mb={2}>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
      <Typography variant="body2" fontWeight="medium">{value || 'Not specified'}</Typography>
    </Box>
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Campaign Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              required
            />
            
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!errors.type}
              required
            >
              <InputLabel>Campaign Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="Campaign Type"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="push">Push Notification</MenuItem>
                <MenuItem value="social">Social Media</MenuItem>
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              margin="normal"
              multiline
              rows={4}
              required
            />
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={!!errors.startDate}
                  helperText={errors.startDate}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
            </Grid>
            
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              error={!!errors.budget}
              helperText={errors.budget}
              margin="normal"
              required
            />
            
            <FormControl 
              fullWidth 
              margin="normal"
              error={!!errors.goal}
              required
            >
              <InputLabel>Campaign Goal</InputLabel>
              <Select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                label="Campaign Goal"
              >
                <MenuItem value="awareness">Brand Awareness</MenuItem>
                <MenuItem value="conversions">Conversions</MenuItem>
                <MenuItem value="engagement">Customer Engagement</MenuItem>
                <MenuItem value="retention">Customer Retention</MenuItem>
                <MenuItem value="revenue">Revenue Generation</MenuItem>
              </Select>
              {errors.goal && <FormHelperText>{errors.goal}</FormHelperText>}
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Define Customer Segment</Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <TextField
                fullWidth
                label="Natural Language Rule"
                name="customRule"
                value={formData.customRule}
                onChange={handleChange}
                error={!!errors.customRule}
                helperText={errors.customRule}
                placeholder="e.g., Customers who spent more than 5000 and live in Maharashtra"
                margin="normal"
                required
              />
              
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                disabled={loading}
                onClick={parseCustomerRule}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Parse Rule'}
              </Button>
            </Box>
            {formData.matchedCustomers.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Matched Customers</Typography>
                <Paper variant="outlined">
                  <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2">
                      Found {formData.matchedCustomers.length} matching customers
                    </Typography>
                  </Box>
                  
                  {formData.matchedCustomers.map((customer, index) => (
                    <Box 
                      key={customer._id} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        borderBottom: index < formData.matchedCustomers.length - 1 ? 1 : 0,
                        borderColor: 'divider'
                      }}
                    >
                      <Avatar src={customer?.name?.charAt(0)}/>
                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant="subtitle2">{customer.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">{customer.state}, {customer.city}</Typography>
                        <Typography variant="body2" color="text.secondary">{customer.inactivity_days} inactivity days</Typography>
                        <Typography variant="body2" color="text.secondary"> Rs {customer.totalAmountSpent} spent</Typography>

                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Campaign Overview</Typography>
            
            <Card variant="outlined">
              <CardHeader
                title={formData.name}
                subheader={formData.type.charAt(0).toUpperCase() + formData.type.slice(1) + ' Campaign'}
                sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
              />
              
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                      Campaign Details
                    </Typography>
                    <CampaignCard title="Description" value={formData.description} />
                    <CampaignCard title="Goal" value={
                      {
                        'awareness': 'Brand Awareness',
                        'conversions': 'Conversions',
                        'engagement': 'Customer Engagement',
                        'retention': 'Customer Retention',
                        'revenue': 'Revenue Generation'
                      }[formData.goal]
                    } />
                    <CampaignCard title="Budget" value={formData.budget} />
                    <CampaignCard 
                      title="Duration" 
                      value={formData.startDate}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                      Audience Segment
                    </Typography>
                    <CampaignCard title="Segment Rule" value={formData.customRule} />
                    <CampaignCard 
                      title="Target Audience" 
                      value={`${formData.matchedCustomers.length} customers matched`} 
                    />
                  </Grid>
                </Grid>
              </CardContent>
              
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Targeted Customers Preview</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.matchedCustomers.slice(0, 8).map((customer) => (
                    <Chip
                      key={customer._id}
                      avatar={<Avatar src={customer?.name.charAt(0)} />}
                      label={customer.name}
                      variant="outlined"
                    />
                  ))}
                  {formData.matchedCustomers.length > 8 && (
                    <Chip 
                      label={`+${formData.matchedCustomers.length - 8} more`}
                      variant="outlined" 
                    />
                  )}
                </Box>
              </Box>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  
  const createCampaign = async () => {
    setLoading(true);
    try {
      
      await axios.post('https://xenocrm-j1t6.onrender.com/api/v1/campaign', formData);
      
     toast.success("Campaign created successfully")
      navigate('/campaigns');
    } catch (err) {
      console.error('Error creating campaign:', err);
      toast.error(err.response?.data?.message || 'Failed to create campaign. Please try again.')
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', p: 3 }}>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      
      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        {renderStepContent(activeStep)}
      </Paper>

     
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            disabled={activeStep === 1 && formData.matchedCustomers.length === 0}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={createCampaign}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Campaign'}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CampaignCreation;