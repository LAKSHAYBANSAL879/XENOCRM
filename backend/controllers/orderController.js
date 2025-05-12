const Order = require("../modals/orders");
const Customer = require("../modals/customers");

exports.createOrder = async (req, res) => {
    try {
      const order = await Order.create(req.body);
  
      const customer = await Customer.findById(order.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, error: "Customer not found" });
      }
  
     
      customer.orders.push(order._id);
      const currentDate = new Date();
  
      if (customer.lastVisited) {
        const diffTime = currentDate - customer.lastVisited;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        customer.inactivity_days = diffDays;
      } else {
        customer.inactivity_days = null;
      }
  
      customer.lastVisited = currentDate;
      customer.totalAmountSpent+=order.amount;
  
      await customer.save(); 
  
      res.status(201).json({ success: true, order });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  };

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customerId");
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customerId");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (order) {
      await Customer.findByIdAndUpdate(order.customerId, {
        $pull: { orders: order._id }
      });
    }
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
