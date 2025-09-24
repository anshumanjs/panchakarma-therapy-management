const mongoose = require('mongoose');

const practitionerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    enum: ['abhyanga', 'shirodhara', 'basti', 'nasya', 'virechana', 'rakta-mokshana', 'general']
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  education: [{
    degree: String,
    institution: String,
    year: Number,
    specialization: String
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String
  }],
  bio: {
    type: String,
    maxlength: 1000
  },
  languages: [String],
  availability: {
    monday: {
      start: { type: String, default: '10:00' }, // HH:MM format
      end: { type: String, default: '17:00' },   // HH:MM format
      isAvailable: { type: Boolean, default: true }
    },
    tuesday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    wednesday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    thursday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    friday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: true }
    },
    saturday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: false }
    },
    sunday: {
      start: { type: String, default: '10:00' },
      end: { type: String, default: '17:00' },
      isAvailable: { type: Boolean, default: false }
    }
  },
  sessionDuration: { // Default session duration in minutes
    type: Number,
    default: 90, // 1.5 hours
    min: 30
  },
  breakTime: { // Default break time between sessions in minutes
    type: Number,
    default: 15,
    min: 0
  },
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for total patients
practitionerSchema.virtual('totalPatients').get(function() {
  return this.patients ? this.patients.length : 0;
});

// Index for better query performance
practitionerSchema.index({ userId: 1 });
practitionerSchema.index({ specialization: 1 });
practitionerSchema.index({ status: 1 });
practitionerSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Practitioner', practitionerSchema);
