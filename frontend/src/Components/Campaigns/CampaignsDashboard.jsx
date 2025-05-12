import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, PieChart, Users, SendIcon, MousePointerClick } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

export default function CampaignsDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignDetails, setCampaignDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const campaignsData = await fetchCampaigns();
        setCampaigns(campaignsData.data || []);
        
        const detailsData = {};
        for (const campaign of campaignsData.data || []) {
          const details = await fetchCampaignDetails(campaign._id);
          detailsData[campaign._id] = details;
        }
        // console.log("details data are",detailsData)
        setCampaignDetails(detailsData);
        
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    const intervalId = setInterval(loadData, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  
  const fetchCampaigns = async () => {
    try {
      const response = await fetch('https://xenocrm-j1t6.onrender.com/api/v1/campaign');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return { data: [] };
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const response = await fetch(`https://xenocrm-j1t6.onrender.com/api/v1/campaign/${campaignId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch details for campaign ${campaignId}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching details for campaign ${campaignId}:`, error);
      return { 
        data: {}, 
        stats: { 
          SENT: 0, 
          FAILED: 0, 
          OPENED: 0, 
          CLICKED: 0 
        } 
      };
    }
  };

  const prepareGoalDistributionData = () => {
    if (!campaigns.length) return null;
    
    const goalCounts = campaigns.reduce((acc, campaign) => {
      const goal = campaign.goal || 'Undefined';
      acc[goal] = (acc[goal] || 0) + 1;
      return acc;
    }, {});
    
    return {
      labels: Object.keys(goalCounts),
      datasets: [
        {
          label: 'Campaign Goals',
          data: Object.values(goalCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareCampaignMetricsData = () => {
    if (!campaigns.length) return null;
    
    // Get data for the 5 most recent campaigns
    const recentCampaigns = [...campaigns]
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5);
    
    const campaignData = recentCampaigns.map(campaign => {
      // console.log("campaign details are",campaign);
      const details = campaignDetails[campaign?._id];
      console.log("details will console",details)
      const stats = details?.stats;
      console.log("stats would print",stats);
      const totalCustomers = details?.data?.matchedCustomers.length;
      console.log("total customers are",totalCustomers)
      
      const openRate = totalCustomers ? (stats.OPENED / totalCustomers) * 100 : 0;
      const clickRate = totalCustomers ? (stats.CLICKED / totalCustomers) * 100 : 0;
      
      return {
        name: campaign.name,
        openRate: parseFloat(openRate.toFixed(2)),
        clickRate: parseFloat(clickRate.toFixed(2))
      };
    });
    
    return {
      labels: campaignData.map(item => item.name),
      datasets: [
        {
          label: 'Open Rate (%)',
          data: campaignData.map(item => item.openRate),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Click Rate (%)',
          data: campaignData.map(item => item.clickRate),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  
  const prepareCommunicationStatusData = () => {
    if (!campaigns.length) return null;
    
    const allStats = {
      SENT: 0,
      FAILED: 0
    };
    
    Object.values(campaignDetails).forEach(details => {
      const stats = details.stats || {};
      allStats.SENT += stats.SENT || 0;
      allStats.FAILED += stats.FAILED || 0;
    });
    
    return {
      labels: ['Sent', 'Failed'],
      datasets: [
        {
          label: 'Communication Status',
          data: [allStats.SENT, allStats.FAILED],
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',
            'rgba(255, 99, 132, 0.7)',
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const goalChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Campaign Goals Distribution',
        font: {
          size: 16
        }
      },
    },
  };

  const metricsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Campaign Performance Metrics',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      }
    }
  };

  const statusChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Communication Status Distribution',
        font: {
          size: 16
        }
      },
    },
  };

  const goalDistributionData = prepareGoalDistributionData();
  const campaignMetricsData = prepareCampaignMetricsData();
  const communicationStatusData = prepareCommunicationStatusData();


  const getDashboardStats = () => {
    if (!campaigns.length) return {};
    
    const totalCampaigns = campaigns.length;
    
    const allCustomerIds = new Set();
    campaigns.forEach(campaign => {
      (campaign.matchedCustomers || []).forEach(customer => {
        allCustomerIds.add(customer._id || customer);
      });
    });
    const totalCustomers = allCustomerIds.size;
    
    let totalSent = 0;
    let totalOpenCount = 0;
    let totalClickCount = 0;
    
    Object.values(campaignDetails).forEach(details => {
      const stats = details.stats || {};
      totalSent += stats.SENT || 0;
      totalOpenCount += stats.OPENED || 0;
      totalClickCount += stats.CLICKED || 0;
    });
    
    const openRate = totalSent ? ((totalOpenCount / totalSent) * 100).toFixed(2) : 0;
    const clickRate = totalSent ? ((totalClickCount / totalSent) * 100).toFixed(2) : 0;
    
    return {
      totalCampaigns,
      totalCustomers,
      totalSent,
      openRate,
      clickRate,
    };
  };

  const stats = getDashboardStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Campaign Analytics Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <BarChart size={24} className="text-blue-600" />
                <h2 className="ml-2 text-lg font-medium">Campaigns</h2>
              </div>
              <p className="text-3xl font-bold">{stats.totalCampaigns || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <Users size={24} className="text-pink-600" />
                <h2 className="ml-2 text-lg font-medium">Customers</h2>
              </div>
              <p className="text-3xl font-bold">{stats.totalCustomers || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <SendIcon size={24} className="text-green-600" />
                <h2 className="ml-2 text-lg font-medium">Messages Sent</h2>
              </div>
              <p className="text-3xl font-bold">{stats.totalSent || 0}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-2">
                <MousePointerClick size={24} className="text-purple-600" />
                <h2 className="ml-2 text-lg font-medium">Engagement</h2>
              </div>
              <p className="text-xl font-bold">Open: {stats.openRate || 0}%</p>
              <p className="text-xl font-bold">Click: {stats.clickRate || 0}%</p>
            </div>
          </div>
          
        
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           
            <div className="bg-white p-4 rounded-lg shadow">
              {goalDistributionData ? (
                <div className="h-80 flex items-center justify-center">
                  <Pie data={goalDistributionData} options={goalChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No goal data available</p>
                </div>
              )}
            </div>
            
            
            <div className="bg-white p-4 rounded-lg shadow">
              {communicationStatusData ? (
                <div className="h-80 flex items-center justify-center">
                  <Pie data={communicationStatusData} options={statusChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No communication data available</p>
                </div>
              )}
            </div>
            
           
            <div className="bg-white p-4 rounded-lg shadow">
              {campaignMetricsData ? (
                <div className="h-80 flex items-center justify-center">
                  <Bar data={campaignMetricsData} options={metricsChartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">No campaign metrics available</p>
                </div>
              )}
            </div>
          </div>
          
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Recent Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.slice(0, 5).map(campaign => {
                    const details = campaignDetails[campaign._id] || { stats: {} };
                    const stats = details.stats || {};
                    const totalCustomers = campaign.matchedCustomers?.length || 0;
                    
                    return (
                      <tr key={campaign._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{campaign.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{campaign.goal || 'Undefined'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{totalCustomers}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stats.OPENED || 0} ({totalCustomers ? ((stats.OPENED / totalCustomers) * 100).toFixed(1) : 0}%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {stats.CLICKED || 0} ({totalCustomers ? ((stats.CLICKED / totalCustomers) * 100).toFixed(1) : 0}%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                              campaign.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 
                              campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                              'bg-green-200 text-green-800'}`}>
                            {campaign.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}