const express = require('express');
const router = express.Router();
const https = require('https');
const { body, validationResult } = require('express-validator');
const Clothing = require('../models/Clothing');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const getCityCoordinates = async (city) => {
  return new Promise((resolve) => {
    const query = encodeURIComponent(`${city}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    https.get(url, {
      headers: { 'User-Agent': 'SwapStyle-App/1.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            });
          } else {
            resolve({ lat: 20.5937, lng: 78.9629 });
          }
        } catch {
          resolve({ lat: 20.5937, lng: 78.9629 });
        }
      });
    }).on('error', () => {
      resolve({ lat: 20.5937, lng: 78.9629 });
    });
  });
};

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
    res.json({ clothes, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
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

    const coords = city ? await getCityCoordinates(city) : { lat: 20.5937, lng: 78.9629 };

    const clothing = new Clothing({
      title, type,
      brand: brand || '',
      size, condition, estimatedValue,
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
  body('title').optional().trim().notEmpty(),
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
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, type, brand, size, condition, estimatedValue, description, city } = req.body;
    if (title) clothing.title = title;
    if (type) clothing.type = type;
    if (brand !== undefined) clothing.brand = brand;
    if (size) clothing.size = size;
    if (condition) clothing.condition = condition;
    if (estimatedValue) clothing.estimatedValue = estimatedValue;
    if (description !== undefined) clothing.description = description;

    if (city && city.trim() !== '') {
      const coords = await getCityCoordinates(city);
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
      return res.status(403).json({ message: 'Not authorized' });
    }
    await clothing.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;