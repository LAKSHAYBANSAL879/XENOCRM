import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Box, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, 
  DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment, MenuItem, Paper, 
  Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, 
  TableSortLabel, TextField, Typography, useMediaQuery, useTheme
} from '@mui/material';

import { 
  BarChart, ChartBarIcon, ChartBarIncreasingIcon, Copy, Edit, PlusCircle, Search, Trash
} from 'lucide-react';
import AnalyticsDialog from './AnalyticsDialog';
import CommunicationLogDialog from './CommunicationLogDialog';
import { UserContext } from '../../userContext';

const DeleteConfirmationDialog = ({ open, handleClose, campaignToDelete, deleteCampaign }) => {
  const handleDelete = async () => {
    await deleteCampaign(campaignToDelete?._id);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the campaign "{campaignToDelete?.name}"? 
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          color="error" 
          variant="contained" 
          onClick={handleDelete}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CampaignList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
   const [isCommunicationLogDialogOpen, setIsCommunicationLogDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignAnalytics, setCampaignAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const {user}=useContext(UserContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('startDate');
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('https://xenocrm-j1t6.onrender.com/api/v1/campaign'); 
        setCampaigns(response.data.data);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  
  const fetchCampaignAnalytics = async (campaignId) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://xenocrm-j1t6.onrender.com/api/v1/campaign/${campaignId}`);
      setCampaignAnalytics(response.data.stats);
      return response.data.stats;
    } catch (error) {
      console.error('Failed to fetch campaign analytics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = Array.isArray(campaigns) ? [...campaigns] : [];
    
    if (searchTerm) {
      result = result.filter(campaign => 
        campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign?.goal?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    
    result.sort((a, b) => {
      if (orderBy === 'startDate') {
        
        if (!a?.startDate) return order === 'asc' ? -1 : 1;
        if (!b?.startDate) return order === 'asc' ? 1 : -1;
        
        return order === 'asc' 
          ? new Date(a?.startDate) - new Date(b?.startDate)
          : new Date(b?.startDate) - new Date(a?.startDate);
      } else {
        const valueA = a[orderBy] ? a[orderBy].toLowerCase() : '';
        const valueB = b[orderBy] ? b[orderBy].toLowerCase() : '';
        
        if (valueA < valueB) {
          return order === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
    
    setFilteredCampaigns(result);
  }, [campaigns, searchTerm, order, orderBy]);

 
  const openAnalyticsDialog = async (campaign) => {
    setSelectedCampaign(campaign);
    const analytics = await fetchCampaignAnalytics(campaign._id);
    setIsAnalyticsDialogOpen(true);
  };
   const openCommunicationLogDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setIsCommunicationLogDialogOpen(true);
  };
  
  const openDeleteDialog = (campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteDialogOpen(true);
  };
    
  const deleteCampaign = async (id) => {
    try {
      await axios.delete(`https://xenocrm-j1t6.onrender.com/api/v1/campaig/${id}`);
      setCampaigns(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };
    
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1" sx={{fontWeight:'bold'}}>
          Campaign Management And Analytics
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleRequestSort('name')}
                >
                  Campaign Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'matchedCustomer.length'}
                  direction={orderBy === 'matchedCustomer.length' ? order : 'asc'}
                  onClick={() => handleRequestSort('matchedCustomer.length')}
                >
                  Target Customers
                </TableSortLabel>
              </TableCell>
              {!isMobile && (
                <>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'startDate'}
                      direction={orderBy === 'startDate' ? order : 'asc'}
                      onClick={() => handleRequestSort('startDate')}
                    >
                      Timeline
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Budget</TableCell>
                </>
              )}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCampaigns
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((campaign) => (
                <TableRow key={campaign?._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{campaign?.name}</Typography>
                    {!isMobile && (
                      <Typography variant="caption" color="text.secondary">
                        {campaign?.goal}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{campaign?.matchedCustomers?.length || 0}</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>
                        {campaign?.startDate ? (
                          <Typography variant="body2">
                            {formatDate(campaign?.startDate)} {campaign?.endDate ? `- ${formatDate(campaign?.endDate)}` : ''}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not scheduled
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                           {campaign?.budget}
                          </Typography>
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={() => openAnalyticsDialog(campaign)}
                    >
                      <BarChart size={18} />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => {openCommunicationLogDialog(campaign)}}
                    >
                      <ChartBarIncreasingIcon size={18} />
                    </IconButton>
                    {user.role === 'admin' ? (
  <IconButton 
    size="small"
    color="error"
    onClick={() => openDeleteDialog(campaign)}
  >
    <Trash size={18} />
  </IconButton>
) : null}

                  </TableCell>
                </TableRow>
              ))}
              
            {filteredCampaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No campaigns found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCampaigns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
         
      <AnalyticsDialog 
        open={isAnalyticsDialogOpen}
        handleClose={() => setIsAnalyticsDialogOpen(false)}
        campaign={selectedCampaign}
        analytics={campaignAnalytics}
      />
       <CommunicationLogDialog
        open={isCommunicationLogDialogOpen}
        handleClose={() => setIsCommunicationLogDialogOpen(false)}
        campaign={selectedCampaign}
      />
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        handleClose={() => setIsDeleteDialogOpen(false)}
        campaignToDelete={selectedCampaign}
        deleteCampaign={deleteCampaign}
      />
    </Container>
  );
};

export default CampaignList;