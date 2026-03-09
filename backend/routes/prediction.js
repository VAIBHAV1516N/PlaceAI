const express = require('express');
const axios = require('axios');
const Prediction = require('../models/Prediction');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Make prediction
router.post('/', protect, async (req, res) => {
  try {
    const { cgpa, internships, communication_skills, technical_skills, aptitude_score, projects, model } = req.body;

    // Call ML API
    const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, {
      cgpa, internships, communication_skills, technical_skills, aptitude_score, projects,
      model: model || 'random_forest'
    });

    const mlResult = mlResponse.data;

    // Save to DB
    const prediction = await Prediction.create({
      userId: req.user._id,
      studentName: req.user.name,
      inputs: { cgpa, internships, communication_skills, technical_skills, aptitude_score, projects },
      result: mlResult
    });

    res.status(201).json({ prediction });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'ML service unavailable. Please ensure the Python API is running.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get user's predictions
router.get('/my', protect, async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ predictions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available ML models
router.get('/models', protect, async (req, res) => {
  try {
    const mlResponse = await axios.get(`${process.env.ML_API_URL}/models`);
    res.json(mlResponse.data);
  } catch {
    res.status(503).json({ error: 'ML service unavailable' });
  }
});

module.exports = router;
