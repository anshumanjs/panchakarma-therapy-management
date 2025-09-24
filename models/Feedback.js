const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  practitioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  therapyType: {
    type: String,
    required: true
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    practitioner: {
      type: Number,
      min: 1,
      max: 5
    },
    facility: {
      type: Number,
      min: 1,
      max: 5
    },
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comments: {
    type: String,
    maxlength: 1000
  },
  symptoms: {
    before: [String],
    after: [String],
    improvement: {
      type: String,
      enum: ['significant', 'moderate', 'slight', 'none', 'worse']
    }
  },
  sideEffects: [String],
  recommendations: {
    type: String,
    maxlength: 500
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  practitionerResponse: {
    type: String,
    maxlength: 1000
  },
  respondedAt: Date
}, {
  timestamps: true
});

// Virtual for average rating
feedbackSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.practitioner,
    this.rating.facility,
    this.rating.cleanliness,
    this.rating.value
  ].filter(rating => rating !== undefined);
  
  if (ratings.length === 0) return 0;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Index for better query performance
feedbackSchema.index({ patient: 1 });
feedbackSchema.index({ practitioner: 1 });
feedbackSchema.index({ appointment: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ 'rating.overall': -1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
