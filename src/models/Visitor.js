import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  // Location data
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  accuracy: {
    type: Number
  },
  address: {
    type: String
  },
  
  // Device information
  userAgent: {
    type: String,
    required: true
  },
  platform: {
    type: String
  },
  browser: {
    type: String
  },
  deviceType: {
    type: String // mobile, desktop, tablet
  },
  screenResolution: {
    width: Number,
    height: Number
  },
  language: {
    type: String
  },
  timezone: {
    type: String
  },
  
  // Network information
  ipAddress: {
    type: String
  },
  connectionType: {
    type: String
  },
  
  // Session information
  sessionId: {
    type: String
  },
  referrer: {
    type: String
  },
  pageUrl: {
    type: String
  },
  
  // Timestamps
  visitedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional metadata
  isFirstVisit: {
    type: Boolean,
    default: true
  },
  visitCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for better query performance
VisitorSchema.index({ visitedAt: -1 });
VisitorSchema.index({ latitude: 1, longitude: 1 });
VisitorSchema.index({ ipAddress: 1 });

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
