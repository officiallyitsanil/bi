import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  ipLocation: {
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
    postal: String,
    timezone: String,
    org: String,
    location: String,
    locality: String,
    sublocality: String,
    district: String,
    state: String
  },

  gpsLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    location: String,
    locality: String,
    sublocality: String,
    district: String,
    state: String,
    country: String,
    postal: String,
    timestamp: Date
  },

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
  location: {
    type: String
  },

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
    type: String
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

  ipAddress: {
    type: String
  },
  connectionType: {
    type: String
  },

  sessionId: {
    type: String
  },
  referrer: {
    type: String
  },
  pageUrl: {
    type: String
  },

  visitedAt: {
    type: Date,
    default: Date.now
  },

  isFirstVisit: {
    type: Boolean,
    default: true
  },
  visitCount: {
    type: Number,
    default: 1
  },

  locationPermission: {
    type: String,
    enum: ['granted', 'denied', 'prompt', 'not_requested'],
    default: 'not_requested'
  },

  isHomepageVisit: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

VisitorSchema.index({ visitedAt: -1 });
VisitorSchema.index({ latitude: 1, longitude: 1 });
VisitorSchema.index({ ipAddress: 1 });

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
