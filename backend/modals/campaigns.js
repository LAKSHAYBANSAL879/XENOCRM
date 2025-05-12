const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: String,
  type:{
    type:String,
    default:'email'
  },
  description: String,
  startDate: Date,
  budget: Number,
  goal: String,
  customRule: String,
  matchedCustomers: [{type:mongoose.Schema.Types.ObjectId,ref:'Customer'}]
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
