const mongoose = require('mongoose');

const therapySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['abhyanga', 'shirodhara', 'basti', 'nasya', 'virechana', 'rakta-mokshana', 'general'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  benefits: [String],
  contraindications: [String],
  duration: {
    type: Number,
    required: true,
    min: 15 // minimum 15 minutes
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  preparationInstructions: {
    type: String,
    maxlength: 1000
  },
  postTreatmentInstructions: {
    type: String,
    maxlength: 1000
  },
  requiredEquipment: [String],
  requiredOils: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner'
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSessions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
therapySchema.index({ type: 1 });
therapySchema.index({ isActive: 1 });
therapySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Therapy', therapySchema);
