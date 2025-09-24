const mongoose = require('mongoose');

const patientDetailSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  medicalHistory: {
    allergies: [String],
    currentMedications: [String],
    chronicConditions: [String],
    previousSurgeries: [String],
    familyHistory: [String]
  },
  problems: [{
    problemId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'improving', 'worsening'],
      default: 'active'
    },
    reportedDate: {
      type: Date,
      default: Date.now
    },
    resolvedDate: Date,
    practitionerNotes: [{
      note: String,
      practitionerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  improvements: [{
    improvementId: {
      type: String,
      required: true
    },
    problemId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    improvementPercentage: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    measurementType: {
      type: String,
      enum: ['pain_scale', 'mobility', 'energy_level', 'sleep_quality', 'mood', 'other'],
      required: true
    },
    beforeValue: Number,
    afterValue: Number,
    unit: String,
    recordedDate: {
      type: Date,
      default: Date.now
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  doshaAssessment: {
    vata: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    pitta: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    kapha: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastAssessed: Date,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  therapyPlan: {
    currentTherapies: [{
      therapyType: String,
      startDate: Date,
      endDate: Date,
      frequency: String,
      practitionerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'cancelled'],
        default: 'active'
      }
    }],
    dietaryRestrictions: [String],
    lifestyleRecommendations: [String],
    followUpSchedule: [{
      date: Date,
      type: String,
      notes: String
    }]
  },
  vitalSigns: [{
    date: {
      type: Date,
      default: Date.now
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: [{
    note: String,
    category: {
      type: String,
      enum: ['general', 'symptom', 'treatment', 'progress', 'concern'],
      default: 'general'
    },
    practitionerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
patientDetailSchema.index({ patientId: 1 });
patientDetailSchema.index({ 'problems.status': 1 });
patientDetailSchema.index({ 'improvements.recordedDate': -1 });
patientDetailSchema.index({ 'vitalSigns.date': -1 });

module.exports = mongoose.model('PatientDetail', patientDetailSchema);
