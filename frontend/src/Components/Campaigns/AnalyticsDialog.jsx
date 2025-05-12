import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography,Box,Grid } from '@mui/material';


const AnalyticsDialog = ({ open, handleClose, campaign, analytics }) => {
  if (!campaign) return null;


  const totalSent = analytics?.SENT || 0;
  const openCount = analytics?.OPENED || 0;
  const clickCount = analytics?.CLICKED || 0;
 const convertedCount = Math.floor(Math.random() * (clickCount + 1));

  
  const openRate = totalSent > 0 ? (openCount / totalSent) * 100 : 0;
  const clickRate = openCount > 0 ? (clickCount / openCount) * 100 : 0;
  const conversionRate = clickCount > 0 ? (convertedCount / clickCount) * 100 : 0;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        {campaign?.name} - Analytics
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Campaign Start Date: {campaign?.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not scheduled'} 
            {campaign?.endDate ? ` to ${new Date(campaign.endDate).toLocaleDateString()}` : ''}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Target Audience Rule: {campaign?.customRule || 'All Customers'}
          </Typography>
 {campaign?.matchedCustomers.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" color='text.secondary' gutterBottom>Matched Customers</Typography>
                <Paper variant="outlined">
                  <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2">
                      Found {campaign?.matchedCustomers.length} matching customers
                    </Typography>
                  </Box>
                  
                  {campaign?.matchedCustomers.map((customer) => (
                    <Box 
                      key={customer._id} 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center',
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

        <Grid container spacing={8}>
          <Grid item xs={12} sm={8} sx={{width:480}}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
              }}
            >
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Opens</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {openCount.toLocaleString()} of {totalSent.toLocaleString()} ({openRate.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${openRate}%`, 
                      height: '100%', 
                      bgcolor: 'primary.main',
                      borderRadius: 1 
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Clicks</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {clickCount.toLocaleString()} ({clickRate.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${clickRate}%`, 
                      height: '100%', 
                      bgcolor: 'info.main',
                      borderRadius: 1 
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Conversions</Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {convertedCount.toLocaleString()} ({conversionRate.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 8, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${conversionRate}%`, 
                      height: '100%', 
                      bgcolor: 'success.main',
                      borderRadius: 1 
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 5, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap:1,
              }}
            >
              <Typography variant="h6" gutterBottom>Revenue Impact</Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                flexGrow: 1
              }}>
                <Typography variant="h3" color="success.main" gutterBottom sx={{mt:-2}}>
                  ${Math.floor(Math.random()*10000) || '$0'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {campaign?.status === 'Active' ? 'Generated so far' : 'Projected revenue'}
                </Typography>
              </Box>
              
              <Box sx={{ }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Campaign goal: {campaign?.goal || 'Increase sales'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};


export default AnalyticsDialog;