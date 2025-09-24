const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'appointment_reminder',
      'appointment_confirmation',
      'appointment_cancellation',
      'therapy_instructions',
      'feedback_request',
      'payment_reminder',
      'system_update',
      'general'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'in-app', 'push'],
      required: true
    },
    sent: { type: Boolean, default: false },
    sentAt: Date,
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'bounced']
    },
    errorMessage: String
  }],
  data: {
    appointmentId: mongoose.Schema.Types.ObjectId,
    patientId: mongoose.Schema.Types.ObjectId,
    practitionerId: mongoose.Schema.Types.ObjectId,
    therapyType: String,
    scheduledDate: Date,
    customData: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });

// TTL index for automatic cleanup of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
