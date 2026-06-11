const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item1: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', required: true },
  item2: { type: mongoose.Schema.Types.ObjectId, ref: 'Clothing', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Negotiating', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

swapSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('SwapRequest', swapSchema);