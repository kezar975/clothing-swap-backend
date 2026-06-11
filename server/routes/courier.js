const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const CourierInfo = require('../models/CourierInfo');
const SwapRequest = require('../models/SwapRequest');
const authMiddleware = require('../middleware/auth');

router.get('/suggestions', async (req, res) => {
  try {
    const { distance } = req.query;
    
    const suggestions = [
      {
        name: 'Dunzo',
        bestFor: 'Same-day delivery (within city)',
        estimatedCost: '₹80-150',
        trackingAvailable: true
      },
      {
        name: 'Delhivery',
        bestFor: 'Inter-city shipping',
        estimatedCost: '₹120-250',
        trackingAvailable: true
      },
      {
        name: 'India Post',
        bestFor: 'Budget-friendly option',
        estimatedCost: '₹60-120',
        trackingAvailable: true
      },
      {
        name: 'Shiprocket',
        bestFor: 'Reliable nationwide',
        estimatedCost: '₹100-200',
        trackingAvailable: true
      },
      {
        name: 'Local Pickup',
        bestFor: 'Same city - meet in person',
        estimatedCost: '₹0',
        trackingAvailable: false
      }
    ];

    res.json({ suggestions });
  } catch (err) {
    console.error('Suggestions Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:swapId', authMiddleware, [
  body('sender.pincode').optional().isLength({ min: 6, max: 6 }),
  body('receiver.pincode').optional().isLength({ min: 6, max: 6 }),
  body('courierService').optional().isIn(['Delhivery', 'Shiprocket', 'IndiaPost', 'Dunzo', 'Pickup', 'Other'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { swapId } = req.params;
    const swap = await SwapRequest.findById(swapId);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    const isParticipant = [swap.sender.toString(), swap.receiver.toString()].includes(req.user.user.id);
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const { sender, receiver, courierService, trackingId, notes } = req.body;

    let estimatedCost = 100;
    if (sender?.pincode && receiver?.pincode) {
      const pinDiff = Math.abs(parseInt(sender.pincode) - parseInt(receiver.pincode));
      if (pinDiff > 10000) estimatedCost = 200;
      else if (pinDiff > 5000) estimatedCost = 150;
      else estimatedCost = 80;
    }

    let courierInfo = await CourierInfo.findOne({ swap: swapId });
    
    if (courierInfo) {
      Object.assign(courierInfo, {
        sender: sender || courierInfo.sender,
        receiver: receiver || courierInfo.receiver,
        courierService: courierService || courierInfo.courierService,
        trackingId: trackingId || courierInfo.trackingId,
        estimatedCost,
        notes: notes || courierInfo.notes
      });
      await courierInfo.save();
    } else {
      courierInfo = new CourierInfo({
        swap: swapId,
        sender: sender || {},
        receiver: receiver || {},
        courierService: courierService || 'Other',
        trackingId: trackingId || '',
        estimatedCost,
        notes: notes || ''
      });
      await courierInfo.save();
    }

    res.json({ message: 'Courier info saved', courierInfo });
  } catch (err) {
    console.error('Courier Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:swapId', authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    const courierInfo = await CourierInfo.findOne({ swap: swapId })
      .populate('swap', 'status');
    
    if (!courierInfo) {
      return res.json({ courierInfo: null, message: 'No courier info yet' });
    }

    res.json({ courierInfo });
  } catch (err) {
    console.error('Fetch Courier Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:swapId/status', authMiddleware, async (req, res) => {
  try {
    const { swapId } = req.params;
    const { shippingStatus } = req.body;
    
    if (!['Not Shipped', 'Packed', 'Shipped', 'In Transit', 'Delivered'].includes(shippingStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const courierInfo = await CourierInfo.findOne({ swap: swapId });
    if (!courierInfo) return res.status(404).json({ message: 'Courier info not found' });

    courierInfo.shippingStatus = shippingStatus;
    if (shippingStatus === 'Shipped') courierInfo.shippedDate = new Date();
    if (shippingStatus === 'Delivered') courierInfo.deliveredDate = new Date();
    
    await courierInfo.save();

    res.json({ message: 'Status updated', courierInfo });
  } catch (err) {
    console.error('Status Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;