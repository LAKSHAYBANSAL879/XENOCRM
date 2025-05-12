const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');

router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getAllCampaigns);
router.get('/:campaignId', campaignController.getCampaignById);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.get('/track/open', campaignController.trackOpen);
router.get('/track/click', campaignController.trackClick);
router.get('/getLogs/:campaignId', campaignController.getCampaignCommunicationLogs);



module.exports = router;