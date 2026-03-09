const express = require('express');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalPredictions = await Prediction.countDocuments();
    const placedCount = await Prediction.countDocuments({ 'result.placed': true });
    const notPlacedCount = await Prediction.countDocuments({ 'result.placed': false });

    const avgCgpa = await Prediction.aggregate([
      { $group: { _id: null, avg: { $avg: '$inputs.cgpa' } } }
    ]);
    const avgProbability = await Prediction.aggregate([
      { $group: { _id: null, avg: { $avg: '$result.probability' } } }
    ]);

    // Model usage stats
    const modelStats = await Prediction.aggregate([
      { $group: { _id: '$result.model_used', count: { $sum: 1 } } }
    ]);

    res.json({
      totalStudents,
      totalPredictions,
      placedCount,
      notPlacedCount,
      placementRate: totalPredictions > 0 ? ((placedCount / totalPredictions) * 100).toFixed(1) : 0,
      avgCgpa: avgCgpa[0]?.avg?.toFixed(2) || 0,
      avgProbability: avgProbability[0]?.avg?.toFixed(1) || 0,
      modelStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all predictions
router.get('/predictions', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const predictions = await Prediction.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Prediction.countDocuments();
    res.json({ predictions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all students
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
