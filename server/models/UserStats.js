const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalSwaps: { type: Number, default: 0 },
  successfulSwaps: { type: Number, default: 0 },
  itemsListed: { type: Number, default: 0 },
  itemsSwapped: { type: Number, default: 0 },
  textileWasteSavedKg: { type: Number, default: 0 },
  co2SavedKg: { type: Number, default: 0 },
  memberSince: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  ecoScore: { type: Number, default: 0 },
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }]
}, { timestamps: true });

userStatsSchema.methods.calculateEcoScore = function () {
  let score = 0;

  score += Math.min(this.successfulSwaps * 10, 40);
  score += Math.min(this.itemsListed * 2, 20);
  score += Math.min(this.textileWasteSavedKg * 2, 30);

  if (this.memberSince) {
    const monthsActive = Math.floor((Date.now() - this.memberSince) / (1000 * 60 * 60 * 24 * 30));
    score += Math.min(monthsActive * 2, 10);
  }

  this.ecoScore = Math.min(score, 100);
  return this.ecoScore;
};

userStatsSchema.methods.checkBadges = function () {
  const newBadges = [];

  if (this.successfulSwaps >= 1 && !this.badges.find(b => b.name === 'First Swap')) {
    newBadges.push({
      name: 'First Swap',
      description: 'Completed your first clothing swap!',
      icon: 'badge-first'
    });
  }

  if (this.successfulSwaps >= 5 && !this.badges.find(b => b.name === 'Eco Warrior')) {
    newBadges.push({
      name: 'Eco Warrior',
      description: 'Completed 5 successful swaps',
      icon: 'badge-eco'
    });
  }

  if (this.successfulSwaps >= 10 && !this.badges.find(b => b.name === 'Sustainability Champion')) {
    newBadges.push({
      name: 'Sustainability Champion',
      description: 'Completed 10 successful swaps',
      icon: 'badge-champion'
    });
  }

  if (this.itemsListed >= 10 && !this.badges.find(b => b.name === 'Active Lister')) {
    newBadges.push({
      name: 'Active Lister',
      description: 'Listed 10 items for swap',
      icon: 'badge-lister'
    });
  }

  if (this.textileWasteSavedKg >= 5 && !this.badges.find(b => b.name === 'Waste Warrior')) {
    newBadges.push({
      name: 'Waste Warrior',
      description: 'Saved 5kg of textile waste',
      icon: 'badge-waste'
    });
  }

  this.badges.push(...newBadges);
  return newBadges;
};

module.exports = mongoose.model('UserStats', userStatsSchema);