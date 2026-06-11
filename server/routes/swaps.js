const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SwapRequest = require('../models/SwapRequest');
const Clothing = require('../models/Clothing');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('item1Id').notEmpty().withMessage('Your item ID is required'),
  body('item2Id').notEmpty().withMessage('Target item ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { receiverId, item1Id, item2Id } = req.body;
    const senderId = req.user.user.id;

    const [item1, item2, receiver] = await Promise.all([
      Clothing.findById(item1Id),
      Clothing.findById(item2Id),
      require('../models/User').findById(receiverId)
    ]);

    if (!item1 || !item2 || !receiver) {
      return res.status(404).json({ message: 'Item or user not found' });
    }

    if (item1.owner.toString() !== senderId) {
      return res.status(403).json({ message: 'You do not own item1' });
    }

    if (item2.owner.toString() !== receiverId) {
      return res.status(403).json({ message: 'Target item owner mismatch' });
    }

    if (item1.status !== 'Available' || item2.status !== 'Available') {
      return res.status(400).json({ message: 'One or both items are not available' });
    }

    const valueDiff = Math.abs(item1.estimatedValue - item2.estimatedValue);
    const maxValue = Math.max(item1.estimatedValue, item2.estimatedValue);
    const isFair = valueDiff <= maxValue * 0.3;

    const swap = new SwapRequest({
      sender: senderId,
      receiver: receiverId,
      item1: item1Id,
      item2: item2Id,
      status: 'Pending',
      isFair
    });

    await swap.save();

    res.status(201).json({ message: 'Swap request sent', swap, isFair });
  } catch (err) {
    console.error('Create Swap Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { status } = req.query;
    
    const filter = { $or: [{ sender: userId }, { receiver: userId }] };
    if (status) filter.status = status;

    const swaps = await SwapRequest.find(filter)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('item1', 'title type brand size condition estimatedValue images')
      .populate('item2', 'title type brand size condition estimatedValue images')
      .sort({ updatedAt: -1 });

    res.json(swaps);
  } catch (err) {
    console.error('Fetch Swaps Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('sender', 'name email location')
      .populate('receiver', 'name email location')
      .populate('item1', 'title estimatedValue')
      .populate('item2', 'title estimatedValue');
    
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    const isSender = swap.sender._id.toString() === req.user.user.id;
    const isReceiver = swap.receiver._id.toString() === req.user.user.id;
    
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: 'Not authorized to view this swap' });
    }

    res.json({ swap });
  } catch (err) {
    console.error('Get Swap Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Accepted', 'Rejected', 'Completed', 'Negotiating'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) return res.status(404).json({ message: 'Swap not found' });

    const isSender = swap.sender.toString() === req.user.user.id;
    const isReceiver = swap.receiver.toString() === req.user.user.id;
    if (!isSender && !isReceiver) return res.status(403).json({ message: 'Not authorized' });

    if (status === 'Accepted' && !isReceiver) return res.status(403).json({ message: 'Only receiver can accept' });
    if (status === 'Completed' && swap.status !== 'Accepted') return res.status(400).json({ message: 'Swap must be accepted first' });

    swap.status = status;
    await swap.save();

    if (status === 'Completed') {
      await Promise.all([
        Clothing.findByIdAndUpdate(swap.item1, { status: 'Swapped' }),
        Clothing.findByIdAndUpdate(swap.item2, { status: 'Swapped' })
      ]);
    }

    res.json({ message: `Swap ${status.toLowerCase()}`, swap });
  } catch (err) {
    console.error('Status Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:swapId/message', authMiddleware, [
  body('message').trim().notEmpty().withMessage('Message cannot be empty'),
  body('message').isLength({ max: 1000 }).withMessage('Message too long (max 1000 chars)')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { swapId } = req.params;
    const { message } = req.body;
    const senderId = req.user.user.id;

    const swap = await SwapRequest.findById(swapId)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');
    
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swap.sender._id.toString() !== senderId && swap.receiver._id.toString() !== senderId) {
      return res.status(403).json({ message: 'Not authorized to message in this swap' });
    }

    if (!swap.messages) {
      swap.messages = [];
    }

    swap.messages.push({
      sender: senderId,
      text: message.trim(),
      timestamp: new Date()
    });

    await swap.save();

    res.status(201).json({
      message: 'Message sent successfully',
      messages: swap.messages
    });
  } catch (err) {
    console.error('Send Message Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;