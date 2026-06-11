const mongoose = require('mongoose');

const courierInfoSchema = new mongoose.Schema({
  swap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwapRequest',
    required: true,
    unique: true
  },
  sender: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    city: String
  },
  receiver: {
    name: String,
    phone: String,
    address: String,
    pincode: String,
    city: String
  },
  courierService: {
    type: String,
    enum: ['Delhivery', 'Shiprocket', 'IndiaPost', 'Dunzo', 'Pickup', 'Other'],
    default: 'Other'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  trackingId: {
    type: String,
    default: ''
  },
  shippingStatus: {
    type: String,
    enum: ['Not Shipped', 'Packed', 'Shipped', 'In Transit', 'Delivered'],
    default: 'Not Shipped'
  },
  shippedDate: Date,
  deliveredDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('CourierInfo', courierInfoSchema);