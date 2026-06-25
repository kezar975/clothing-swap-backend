const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Clothing = require('../models/Clothing');
const SwapRequest = require('../models/SwapRequest');


const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.patch('/users/:id/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: req.body.isBanned },
      { new: true }
    ).select('-password');
    res.json({ message: `User ${req.body.isBanned ? 'banned' : 'unbanned'}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/listings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const listings = await Clothing.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/listings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Clothing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/swaps', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('item1', 'title estimatedValue')
      .populate('item2', 'title estimatedValue')
      .sort({ createdAt: -1 });
    res.json({ swaps });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalListings, totalSwaps, completedSwaps, pendingSwaps] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments(),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: 'Completed' }),
      SwapRequest.countDocuments({ status: 'Pending' })
    ]);
    res.json({ totalUsers, totalListings, totalSwaps, completedSwaps, pendingSwaps });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;