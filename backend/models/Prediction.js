const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  inputs: {
    cgpa: { type: Number, required: true },
    internships: { type: Number, required: true },
    communication_skills: { type: Number, required: true },
    technical_skills: { type: Number, required: true },
    aptitude_score: { type: Number, required: true },
    projects: { type: Number, required: true }
  },
  result: {
    placed: { type: Boolean, required: true },
    probability: { type: Number, required: true },
    model_used: { type: String, required: true },
    model_accuracy: { type: Number },
    feature_importances: { type: Object }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
