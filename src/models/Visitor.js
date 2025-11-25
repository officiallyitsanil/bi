import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
  // IP-based location (approximate)
  ipLocation: {
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
    postal: String,
    timezone: String,
    org: String, // ISP/Organization
    location: String, // Full formatted location
    locality: String, // City/Town name
    sublocality: String, // Area/Neighborhood
    district: String,
    state: String
  },
  
  // GPS-based location (accurate - requires permission)
  gpsLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    location: String, // Full formatted location
    locality: String, // City/Town name
    sublocality: String, // Area/Neighborhood
    district: String,
    state: String,
    country: String,
    postal: String,
    timestamp: Date
  },
  
  // Legacy fields for backward compatibility
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
  },
  
  // Location permission status
  locationPermission: {
    type: String,
    enum: ['granted', 'denied', 'prompt', 'not_requested'],
    default: 'not_requested'
  },
  
  // Track if this is homepage visit
  isHomepageVisit: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
VisitorSchema.index({ visitedAt: -1 });
VisitorSchema.index({ latitude: 1, longitude: 1 });
VisitorSchema.index({ ipAddress: 1 });

export default mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
