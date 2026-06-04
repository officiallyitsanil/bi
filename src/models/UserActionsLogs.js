import mongoose from 'mongoose';

const UserActionsLogsSchema = new mongoose.Schema({
  userPhoneNumber: {
    type: String,
    required: false,
    default: ''
  },
  userName: {
    type: String,
    required: false,
    default: ''
  },
  userEmail: {
    type: String,
    required: false,
    default: ''
  },
  actionType: {
    type: String,
    required: true // e.g. "login", "copy_whatsapp", "copy_phone", "click_email", "view_property"
  },
  ipAddress: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

export default mongoose.models.UserActionsLogs || mongoose.model('UserActionsLogs', UserActionsLogsSchema);
