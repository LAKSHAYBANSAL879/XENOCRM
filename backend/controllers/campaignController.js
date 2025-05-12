const Campaign = require('../modals/campaigns');
const { sendToQueue } = require('../rabbit');
const CommunicationLog=require('../modals/communicationLog');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const { getNgrokUrl } = require('../ngrokConfig');

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

exports.createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);

    await campaign.save();

   await processCampaign(campaign._id);
   

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('matchedCustomers');
    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns',
      error: error.message
    });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId)
      .populate('matchedCustomers');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get communication stats for this campaign
    const stats = await CommunicationLog.aggregate([
      { $match: { campaignId: campaign._id } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
      }},
    ]);

    // Format stats into a more usable object
    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    // Add open and click stats
    const openCount = await CommunicationLog.countDocuments({ 
      campaignId: campaign._id,
      opened: true 
    });
    
    const clickCount = await CommunicationLog.countDocuments({ 
      campaignId: campaign._id,
      clicked: true 
    });

    formattedStats.OPENED = openCount;
    formattedStats.CLICKED = clickCount;

    res.status(200).json({
      success: true,
      data: campaign,
      stats: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign',
      error: error.message
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign',
      error: error.message
    });
  }
};


const processCampaign = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId).populate('matchedCustomers');
    
    if (!campaign) {
      console.error(`Campaign with ID ${campaignId} not found`);
      return;
    }
    
    const customers = campaign.matchedCustomers;
    if (!customers || customers.length === 0) {
      console.log(`No customers found for campaign: ${campaign.name}`);
      return;
    }
    
    console.log(`Processing campaign: ${campaign.name} for ${customers.length} customers`);
    
    let queuedCount = 0;
    let errorCount = 0;
    
    for (const customer of customers) {
      try {
        const personalizedMessage = await generatePersonalizedMessage(customer, campaign);
        
        // Prepare payload for RabbitMQ queue
        const payload = {
          customerId: customer._id,
          campaignId: campaign._id,
          email: customer.email,
          subject: `Special offer from ${campaign.name}`,
          message: personalizedMessage
        };

        const redirectUrl = encodeURIComponent("https://xenocrm-five.vercel.app/");
        const clickTrackingUrl = `${getNgrokUrl()}/api/v1/campaign/track/click?cid=${campaign._id}&uid=${customer._id}&redirect=${redirectUrl}`;
        const trackingUrl = `${getNgrokUrl()}/api/v1/campaign/track/open?cid=${campaign._id}&uid=${customer._id}&cb=${Date.now()}`;

        const htmlMessage = `
          <p>${personalizedMessage}</p>
          <p>Check our new launch: <a href="${clickTrackingUrl}">Click here</a></p>
          <img src="${trackingUrl}" width="1" height="1" style="display:none;" />
        `;

        
        await CommunicationLog.updateOne(
          { campaignId: campaign._id, customerId: customer._id },
          { 
            $set: { 
              status: 'QUEUED',
            }
          },
          { upsert: true }
        );
        
       
        await sendToQueue('email_campaign_queue', payload);
        
        // Send actual email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.email,
          subject: payload.subject,
          html: htmlMessage
        });

        queuedCount++;
      } catch (customerError) {
        console.error(`Error processing customer ${customer._id} for campaign ${campaignId}:`, customerError);
        
        
        await CommunicationLog.updateOne(
          { campaignId: campaign._id, customerId: customer._id },
          { 
            $set: { 
              status: 'ERROR',
            }
          },
          { upsert: true }
        );
        
        errorCount++;
      }
    }
    
    console.log(`Campaign ${campaign.name} processing completed:`);
    console.log(`- Total customers: ${customers.length}`);
    console.log(`- Successfully queued: ${queuedCount}`);
    console.log(`- Processing errors: ${errorCount}`);
    
    
    setTimeout(async () => {
     
      const sentCount = await CommunicationLog.countDocuments({ 
        campaignId: campaign._id,
        status: 'SENT'
      });
      
      const failedCount = await CommunicationLog.countDocuments({
        campaignId: campaign._id,
        status: 'FAILED'
      });
      
      
      console.log(`Final delivery stats for campaign ${campaign.name}:`);
      console.log(`- Sent: ${sentCount}`);
      console.log(`- Failed: ${failedCount}`);
    }, 5000);
    
  } catch (error) {
    console.error('Error processing campaign:', error);
    
    throw error; 
  }
};


const generatePersonalizedMessage = async (customer, campaign) => {
  try {
    
    const fallbackMessage = `Hi ${customer.name || 'valued customer'}, here's offer for your next order!`;
  
    try {
      const prompt = `
        Create a personalized marketing email message for a customer with the following details and dont include subject in mail start from main content only:
        - Customer name: ${customer.name || ''}
        - Campaign name: ${campaign.name}
        - Campaign description: ${campaign.description || 'Special offer'}
        - Campaign goal: ${campaign.goal || 'Increase sales'}
        
        Make it concise, friendly, and personalized. include any offer detail from description itself company name as Team CRM.
      `;
      
      const result = await model.generateContent(prompt);
      const generatedText = result.response.text().trim();
      
      return generatedText || fallbackMessage;
    } catch (aiError) {
      console.warn('AI message generation failed, using default template:', aiError);
      return fallbackMessage;
    }
  } catch (error) {
    console.error('Error generating personalized message:', error);
    return `Hi there, here's 10% off on your next order!`;
  }
};
exports.trackOpen=async(req, res) => {
  const { cid, uid } = req.query;
  console.log(` Email opened for Campaign ID: ${cid}, User ID: ${uid}`);

await CommunicationLog.updateOne(
      { campaignId: cid, customerId: uid },
      { $set: { opened: true, openedAt: new Date() } },
      { upsert: true }
    );
  // Return a 1x1 transparent GIF
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
    "base64"
  );

res.setHeader("Content-Type", "image/gif");
res.setHeader("Content-Length", pixel.length);
res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
res.setHeader("Pragma", "no-cache");
res.setHeader("Expires", "0");
res.status(200).end(pixel);
};
exports.trackClick= async (req, res) => {
  const { cid, uid, redirect } = req.query;

  try {
    console.log(` Email link clicked: Campaign ID = ${cid}, User ID = ${uid}`);

      await CommunicationLog.updateOne(
      { campaignId: cid, customerId: uid },
      {
        $set: {
          clicked: true,
          clickedAt: new Date(),
          opened: true,
          openedAt: new Date()
        }
      },
      { upsert: true }
    );

    return res.redirect(decodeURIComponent(redirect));
  } catch (err) {
    console.error("❌ Click tracking error:", err);
    return res.status(500).send("Something went wrong.");
  }
};
exports.getCampaignCommunicationLogs = async (req, res) => {
  try {
    const logs = await CommunicationLog.find({ campaignId: req.params.campaignId}).populate('customerId').populate('campaignId');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve communication logs',
      error: error.message
    });
  }
};