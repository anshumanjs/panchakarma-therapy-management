const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  therapyType: {
    type: String,
    enum: ['abhyanga', 'shirodhara', 'basti', 'nasya', 'virechana', 'rakta-mokshana', 'consultation'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15 // minimum 15 minutes
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  preSessionInstructions: {
    type: String,
    maxlength: 1000
  },
  postSessionInstructions: {
    type: String,
    maxlength: 1000
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'in-app']
    },
    scheduledTime: Date,
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],
  sessionNotes: {
    practitionerNotes: String,
    patientFeedback: String,
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number
    },
    symptoms: [String],
    sideEffects: [String],
    improvement: String
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'refunded'],
    default: 'pending'
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'practitioner', 'system']
  },
  cancelledAt: Date
}, {
  timestamps: true
});

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Virtual for is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return new Date(this.scheduledDate) > new Date();
});

// Virtual for is past
appointmentSchema.virtual('isPast').get(function() {
  return new Date(this.scheduledDate) < new Date();
});

// Index for better query performance
appointmentSchema.index({ patient: 1, scheduledDate: 1 });
appointmentSchema.index({ practitioner: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ therapyType: 1 });

// Prevent double booking
appointmentSchema.index({ 
  practitioner: 1, 
  scheduledDate: 1, 
  startTime: 1 
}, { 
  unique: true,
  partialFilterExpression: { status: { $in: ['scheduled', 'confirmed'] } }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
