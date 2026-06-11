const express = require('express');
const router = express.Router();
const UserStats = require('../models/UserStats');
const SwapRequest = require('../models/SwapRequest');
const Clothing = require('../models/Clothing');
const authMiddleware = require('../middleware/auth');

router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    let stats = await UserStats.findOne({ user: userId }).populate('user', 'name email');
    
    if (!stats) {
      const swapCount = await SwapRequest.countDocuments({ 
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'Completed'
      });
      
      const listedCount = await Clothing.countDocuments({ owner: userId });
      
      stats = new UserStats({
        user: userId,
        successfulSwaps: swapCount,
        totalSwaps: swapCount,
        itemsListed: listedCount,
        itemsSwapped: swapCount * 2,
        textileWasteSavedKg: swapCount * 0.5,
        co2SavedKg: swapCount * 0.24
      });
      
      stats.calculateEcoScore();
      stats.checkBadges();
      await stats.save();
    }
    
    res.json({ stats });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/platform', async (req, res) => {
  try {
    const totalUsers = await UserStats.countDocuments();
    const totalSwaps = await SwapRequest.countDocuments({ status: 'Completed' });
    const totalListings = await Clothing.countDocuments();
    const totalWasteSaved = totalSwaps * 0.5;
    const totalCO2Saved = totalSwaps * 0.24;
    
    res.json({
      stats: {
        totalUsers,
        totalSwaps,
        totalListings,
        totalWasteSaved: totalWasteSaved.toFixed(1),
        totalCO2Saved: totalCO2Saved.toFixed(1),
        activeSwaps: await SwapRequest.countDocuments({ status: { $in: ['Pending', 'Accepted'] } })
      }
    });
  } catch (err) {
    console.error('Platform Stats Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { userId, swapCompleted } = req.body;
    
    let stats = await UserStats.findOne({ user: userId });
    if (!stats) {
      stats = new UserStats({ user: userId });
    }
    
    if (swapCompleted) {
      stats.successfulSwaps += 1;
      stats.totalSwaps += 1;
      stats.itemsSwapped += 2;
      stats.textileWasteSavedKg += 0.5;
      stats.co2SavedKg += 0.24;
    }
    
    stats.calculateEcoScore();
    const newBadges = stats.checkBadges();
    await stats.save();
    
    res.json({ stats, newBadges });
  } catch (err) {
    console.error('Update Stats Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await UserStats.find()
      .populate('user', 'name')
      .sort({ ecoScore: -1, successfulSwaps: -1 })
      .limit(10)
      .select('user ecoScore successfulSwaps textileWasteSavedKg badges');
    
    res.json({ leaderboard: topUsers });
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;