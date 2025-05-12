import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import CampaignsDashboard from './CampaignsDashboard';
import CampaignCreation from './CampaignCreation';
import CampaignList from './CampaignList';


const CampaignsHome = () => {

  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    if (activeTab === 0) return <CampaignList/>;
    if (activeTab === 1) return <CampaignsDashboard/>;
    if (activeTab === 2) return <CampaignCreation/>;

  };

  return (
    <div className='mt-5'>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: '700',
          fontFamily: 'sans-serif',
        }}
      >
         Campaigns
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleChange}
        aria-label="Campaign Home Navigation Tabs"
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="All Campaigns" sx={{ fontSize: '18px' }} />
        <Tab label="Dashboard" sx={{ fontSize: '18px' }} />
        <Tab label="New Campaign" sx={{ fontSize: '18px' }} />

        </Tabs>

      <Box p={3}>{renderContent()}</Box>
    </div>
  );
};

export default CampaignsHome;
