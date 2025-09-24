const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'profile_update',
      'appointment_book',
      'appointment_cancel',
      'therapy_session_start',
      'therapy_session_end',
      'feedback_submit',
      'payment_made',
      'wallet_topup',
      'report_view',
      'dashboard_access',
      'gallery_view',
      'feedback_view'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  sessionId: {
    type: String
  },
  resourceId: {
    type: String // ID of the resource being accessed (appointment, therapy, etc.)
  }
}, {
  timestamps: true
});

// Index for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
