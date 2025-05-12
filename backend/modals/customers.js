const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  mobile: { type: String },
  city: { type: String },
  state: { type: String },
  lastVisited: { type: Date },
  inactivity_days: { type: Number },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  totalAmountSpent: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });


customerSchema.pre('save', function (next) {
  if (this.lastVisited) {
    const currentDate = new Date();
    const diffTime = currentDate - this.lastVisited;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    this.inactivity_days = diffDays;
  } else {
    this.inactivity_days = null;
  }
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
