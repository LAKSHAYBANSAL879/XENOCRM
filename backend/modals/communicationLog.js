const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  status: { type: String, default:"SENT" },
  opened: { type: Boolean, default: false },
  clicked: { type: Boolean, default: false },
   openedAt: {
    type: Date
  },
  clickedAt: {
    type: Date
  },
  sentAt:{
    type:Date
  }
},{timestamps:true});

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
