import { CircularProgress, Dialog, DialogContent, DialogTitle, Tab, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography,TableBody,TablePagination,DialogActions,Button,Box,Grid,Table } from '@mui/material';
import axios from 'axios';
import { AlertCircle, Check, Mail, X } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';

const CommunicationLogDialog = ({ open, handleClose, campaign }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (open && campaign?._id) {
      fetchCommunicationLogs(campaign._id);
    }
  }, [open, campaign]);

  const fetchCommunicationLogs = async (campaignId) => {
    setLoading(true);
    try {
      
      const response = await axios.get(`https://xenocrm-j1t6.onrender.com/api/v1/campaign/getLogs/${campaignId}`);
      setLogs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch communication logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event, newValue) => {
    setFilterStatus(newValue);
    setPage(0);
  };

  // Apply filters to logs
  const filteredLogs = logs.filter(log => {
    if (filterStatus === 'all') return true;
    return log.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusInfo = (status, opened, clicked) => {
    if (clicked) {
      return { icon: <Check size={16} />, color: 'success.main', label: 'Clicked' };
    }
    if (opened) {
      return { icon: <Mail size={16} />, color: 'info.main', label: 'Opened' };
    }
    
    switch(status?.toLowerCase()) {
      case 'sent':
        return { icon: <Check size={16} />, color: 'success.main', label: 'Sent' };
      case 'failed':
        return { icon: <X size={16} />, color: 'error.main', label: 'Failed' };
      case 'pending':
        return { icon: <AlertCircle size={16} />, color: 'warning.main', label: 'Pending' };
      default:
        return { icon: <Mail size={16} />, color: 'text.secondary', label: status || 'Unknown' };
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        {campaign?.name} - Communication Log
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={filterStatus} 
            onChange={handleStatusFilterChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All" value="all" />
            <Tab label="Sent" value="sent" />
            <Tab label="Opened" value="opened" />
            <Tab label="Clicked" value="clicked" />
            <Tab label="Failed" value="failed" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Recipient</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Date Sent</TableCell>
                    <TableCell>Date Opened</TableCell>
                    <TableCell>Date Clicked</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((log) => {
                        const statusInfo = getStatusInfo(log.status, log.opened, log.clicked);
                        return (
                          <TableRow hover key={log._id}>
                            <TableCell>
                              <Typography variant="body2">{log?.customerId?.name || 'N/A'}</Typography>
                              <Typography variant="caption" color="text.secondary">{log?.customerId?.email ||  ''}</Typography>
                            </TableCell>
                            <TableCell>{log.type || 'Email'}</TableCell>
                            <TableCell>{formatDateTime(log.sentAt)}</TableCell>
                            <TableCell>{log.opened ? formatDateTime(log.openedAt) : 'Not opened'}</TableCell>
                            <TableCell>{log.clicked ? formatDateTime(log.clickedAt) : 'Not clicked'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box component="span" sx={{ color: statusInfo.color, display: 'flex', mr: 1 }}>
                                  {statusInfo.icon}
                                </Box>
                                <Typography variant="body2">{statusInfo.label}</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No communication logs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
export default CommunicationLogDialog