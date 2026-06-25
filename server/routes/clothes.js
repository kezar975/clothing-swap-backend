const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Clothing = require('../models/Clothing');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => { 
  try {
    const { type, size, condition, status, city, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (type && type.trim() !== '') filter.type = type;
    if (size && size.trim() !== '') filter.size = new RegExp(`^${size}$`, 'i');
    if (condition && condition.trim() !== '') filter.condition = condition;
    if (status && status.trim() !== '') {
      filter.status = status;
    } else {
      filter.status = 'Available';
    }
    if (city && city.trim() !== '') {
      filter['location.city'] = new RegExp(city.trim(), 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const clothes = await Clothing.find(filter)
      .populate('owner', 'name email location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Clothing.countDocuments(filter);

    res.json({
      clothes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Fetch Clothes Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id)
      .populate('owner', 'name email location');

    if (!clothing) return res.status(404).json({ message: 'Item not found' });
    res.json({ clothing });
  } catch (err) {
    console.error('Fetch Clothing Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, upload.single('image'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('type').isIn(['T-Shirt', 'Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Other']).withMessage('Invalid type'),
  body('size').trim().notEmpty().withMessage('Size is required'),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair']).withMessage('Invalid condition'),
  body('estimatedValue').isNumeric().withMessage('Value must be a number'),
  body('city').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, type, brand, size, condition, estimatedValue, description, city } = req.body;
    const imageUrl = req.file ? req.file.path : '';
    
    const cityCoordinates = {
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'surat': { lat: 21.1702, lng: 72.8311 }
    };

    const cityName = city?.toLowerCase().trim() || '';
    const coords = cityCoordinates[cityName] || { lat: 19.0760, lng: 72.8777 };

    const clothing = new Clothing({
      title,
      type,
      brand: brand || '',
      size,
      condition,
      estimatedValue,
      description: description || '',
      images: imageUrl ? [imageUrl] : [],
      owner: req.user.user.id,
      status: 'Available',
      location: {
        city: city || 'Unknown',
        coordinates: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        }
      }
    });

    await clothing.save();
    res.status(201).json({ message: 'Item listed successfully', clothing });
  } catch (err) {
    console.error('Create Clothing Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, upload.single('image'), [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('type').optional().isIn(['T-Shirt', 'Shirt', 'Pants', 'Jacket', 'Dress', 'Shoes', 'Other']),
  body('condition').optional().isIn(['New', 'Like New', 'Good', 'Fair']),
  body('estimatedValue').optional().isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) return res.status(404).json({ message: 'Item not found' });

    if (clothing.owner.toString() !== req.user.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, type, brand, size, condition, estimatedValue, description, city } = req.body;
    
    if (title !== undefined && title.trim() !== '') clothing.title = title;
    if (type !== undefined) clothing.type = type;
    if (brand !== undefined) clothing.brand = brand;
    if (size !== undefined && size.trim() !== '') clothing.size = size;
    if (condition !== undefined) clothing.condition = condition;
    if (estimatedValue !== undefined) clothing.estimatedValue = estimatedValue;
    if (description !== undefined) clothing.description = description;
    
    if (city !== undefined && city.trim() !== '') {
      const cityCoordinates = {
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'delhi': { lat: 28.7041, lng: 77.1025 },
        'bangalore': { lat: 12.9716, lng: 77.5946 },
        'chennai': { lat: 13.0827, lng: 80.2707 },
        'kolkata': { lat: 22.5726, lng: 88.3639 },
        'hyderabad': { lat: 17.3850, lng: 78.4867 },
        'pune': { lat: 18.5204, lng: 73.8567 },
        'ahmedabad': { lat: 23.0225, lng: 72.5714 },
        'jaipur': { lat: 26.9124, lng: 75.7873 },
        'surat': { lat: 21.1702, lng: 72.8311 }
      };
      const cityName = city.toLowerCase().trim();
      const coords = cityCoordinates[cityName] || clothing.location.coordinates.coordinates;
      
      clothing.location = {
        city: city,
        coordinates: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        }
      };
    }

    if (req.file) {
      clothing.images = [req.file.path];
    }

    await clothing.save();
    res.json({ message: 'Item updated successfully', clothing });
  } catch (err) {
    console.error('Update Clothing Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) return res.status(404).json({ message: 'Item not found' });

    if (clothing.owner.toString() !== req.user.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await clothing.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete Clothing Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;