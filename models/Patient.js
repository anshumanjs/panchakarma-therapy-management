const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  medicalHistory: {
    allergies: [String],
    currentMedications: [String],
    chronicConditions: [String],
    previousSurgeries: [String],
    bloodType: String
  },
  panchakarmaHistory: {
    previousTreatments: [{
      therapyType: String,
      date: Date,
      duration: Number,
      practitioner: String,
      notes: String
    }],
    currentTherapy: {
      type: String,
      startDate: Date,
      expectedDuration: Number,
      sessionsCompleted: { type: Number, default: 0 },
      totalSessions: Number
    }
  },
  healthGoals: [String],
  dietaryRestrictions: [String],
  lifestyle: {
    occupation: String,
    exerciseFrequency: String,
    sleepPattern: String,
    stressLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very-high']
    }
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  assignedPractitioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Index for better query performance
patientSchema.index({ userId: 1 });
patientSchema.index({ assignedPractitioner: 1 });
patientSchema.index({ status: 1 });

module.exports = mongoose.model('Patient', patientSchema);
