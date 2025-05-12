const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  items: [{ name: String, quantity: Number }],
  discount: { type: Number, default: 0 }, 
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
