const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true, trim: true },
  type: {
  type: String,
  enum: ['T-Shirt', 'Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Other'],
  required: true
},
  brand: { type: String, trim: true, default: 'Unbranded' },
  size: { type: String, required: true, trim: true },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair']
  },
  estimatedValue: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true, default: '' },
  images: [{ type: String }],
  location: {
    city: { type: String, default: '' },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Swapped'],
    default: 'Available'
  },
  createdAt: { type: Date, default: Date.now }
});


clothingSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Clothing', clothingSchema);